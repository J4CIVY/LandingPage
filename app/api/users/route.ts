import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { compatibleUserSchema } from '@/schemas/compatibleUserSchema';
import { checkRateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyRecaptcha, RecaptchaThresholds, isLikelyHuman } from '@/lib/recaptcha-server';
import { trackFailedLogin } from '@/lib/anomaly-detection';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { requireAdmin } from '@/lib/auth-utils';

/**
 * GET /api/users
 * Obtiene todos los usuarios registrados
 * PROTEGIDO: Solo administradores
 */
async function handleGet(request: NextRequest) {
  // 🔒 SEGURIDAD: Verificar que el usuario sea administrador
  const authResult = await requireAdmin(request);
  
  if (!authResult.success || !authResult.isValid) {
    return createErrorResponse(
      authResult.error || 'Acceso denegado. Se requieren permisos de administrador',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
  
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const role = searchParams.get('role');
  const isActive = searchParams.get('isActive');
  
  // Construir filtros
  const filters: any = {};
  if (role) filters.role = role;
  if (isActive !== null) filters.isActive = isActive === 'true';
  
  // Obtener usuarios con paginación
  const skip = (page - 1) * limit;
  const users = await User.find(filters)
    .select('-password') // Excluir contraseña
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  
  const total = await User.countDocuments(filters);
  
  return createSuccessResponse({
    users,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }, 'Usuarios obtenidos exitosamente');
}

/**
 * POST /api/users
 * Registra un nuevo usuario
 * PROTECCIÓN: CSRF + reCAPTCHA v3 + Rate Limiting + Anomaly Detection
 */
async function handlePost(request: NextRequest) {
  // 0. CSRF Protection (NEW in Security Audit Phase 2)
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  // 1. Enhanced Distributed Rate Limiting (Redis-backed)
  const rateLimitResult = await checkRateLimit(request, RateLimitPresets.REGISTER);
  
  if (!rateLimitResult.success) {
    const response = createErrorResponse(
      `Demasiados intentos de registro. Intenta nuevamente en ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.`,
      429
    );
    addRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  }

  await connectDB();
  
  // Obtener datos del request
  const requestData = await request.json();
  
  // 2. reCAPTCHA v3 Verification
  const recaptchaToken = requestData.recaptchaToken;
  
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'register');
    
    if (!recaptchaResult.success || !isLikelyHuman(recaptchaResult.score, RecaptchaThresholds.REGISTER)) {
      // 3. Track failed registration attempt for anomaly detection
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      if (requestData.email) {
        await trackFailedLogin(requestData.email, clientIP, userAgent);
      }
      
      return createErrorResponse(
        'Verificación de seguridad fallida. Por favor, intenta de nuevo.',
        HTTP_STATUS.FORBIDDEN,
        { riskScore: recaptchaResult.score }
      );
    }
  }
  
  // Remover confirmPassword antes de validar
  const { confirmPassword, recaptchaToken: _, ...dataToValidate } = requestData;
  
  // Crear un esquema sin confirmPassword para validación del backend
  const backendSchema = compatibleUserSchema.omit({ confirmPassword: true });
  
  try {
    // Validar datos sin confirmPassword
    const userData = backendSchema.parse(dataToValidate);
    

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [
        { email: userData.email },
        { documentNumber: userData.documentNumber }
      ]
    });
  
    if (existingUser) {
      if (existingUser.email === userData.email) {
        return createErrorResponse(
          'Ya existe un usuario registrado con este email',
          HTTP_STATUS.CONFLICT
        );
      }
      if (existingUser.documentNumber === userData.documentNumber) {
        return createErrorResponse(
          'Ya existe un usuario registrado con este número de documento',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Generar token de verificación de email
    const emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
    
    // Crear nuevo usuario - el middleware del modelo se encarga del hashing
    const newUser = new User({
      ...userData,
      password: userData.password, // Usar la contraseña sin hashear (el middleware se encarga)
      isActive: false, // Inactivo hasta verificar email
      isEmailVerified: false,
      emailVerificationToken,
      membershipType: userData.membershipType || 'friend' // Membresía por defecto
    });

    await newUser.save();

    // Enviar email de verificación
    try {
      const { EmailService } = await import('@/lib/email-service');
      const emailService = new EmailService();
      await emailService.sendEmailVerification(
        userData.email,
        `${userData.firstName} ${userData.lastName}`,
        emailVerificationToken
      );
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      // No fallar el registro si el email falla, el usuario puede solicitar reenvío
    }

    // Retornar usuario sin la contraseña
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return createSuccessResponse(
      {
        user: {
          id: userResponse._id,
          email: userResponse.email,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          phone: userResponse.phone,
          membershipType: userResponse.membershipType,
          isActive: userResponse.isActive,
          createdAt: userResponse.createdAt
        }
      },
      'Usuario registrado exitosamente',
      HTTP_STATUS.CREATED
    );
  } catch (error: any) {
    console.error('❌ Error en validación o registro:', error);
    
    if (error.name === 'ZodError') {
      return createErrorResponse(
        'Error de validación en los datos enviados',
        HTTP_STATUS.VALIDATION_ERROR,
        error.errors
      );
    }
    
    return createErrorResponse(
      'Error interno del servidor',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

// Handler principal
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
