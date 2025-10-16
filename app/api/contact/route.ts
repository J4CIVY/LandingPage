import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
import { contactMessageSchema } from '@/lib/validation-schemas';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyRecaptcha, RecaptchaThresholds, isLikelyHuman } from '@/lib/recaptcha-server';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/contact
 * Obtiene mensajes de contacto (solo para administradores)
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (status) {
    mongoFilters.status = status;
  }
  
  if (category) {
    mongoFilters.category = category;
  }
  
  if (priority) {
    mongoFilters.priority = priority;
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener mensajes con paginación
  const messages = await ContactMessage.find(mongoFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email')
    .exec();
  
  const totalMessages = await ContactMessage.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    messages,
    pagination: {
      page,
      limit,
      total: totalMessages,
      pages: Math.ceil(totalMessages / limit)
    }
  }, 'Mensajes obtenidos exitosamente');
}

/**
 * POST /api/contact
 * Crea un nuevo mensaje de contacto
 * PROTECCIÓN: reCAPTCHA v3 + Rate Limiting
 */
async function handlePost(request: NextRequest) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  // 1. Enhanced Rate Limiting for Contact Form (5 messages per hour)
  const rateLimitResult = await checkRateLimit(request, {
    maxRequests: 5,
    windowSeconds: 3600, // 1 hour
    keyPrefix: 'ratelimit:contact',
  });
  
  if (!rateLimitResult.success) {
    const response = createErrorResponse(
      `Demasiados mensajes enviados. Intenta nuevamente en ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.`,
      429
    );
    addRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  }

  await connectDB();
  
  // 2. Get request body including reCAPTCHA token
  const body = await request.json();
  const recaptchaToken = body.recaptchaToken;
  
  // 3. reCAPTCHA v3 Verification
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'contact_form');
    
    if (!recaptchaResult.success || !isLikelyHuman(recaptchaResult.score, RecaptchaThresholds.CONTACT_FORM)) {
      return createErrorResponse(
        'Verificación de seguridad fallida. Por favor, intenta de nuevo.',
        HTTP_STATUS.FORBIDDEN,
        { riskScore: recaptchaResult.score }
      );
    }
  }
  
  // Remove recaptchaToken before validation
  const { recaptchaToken: _, ...contactData } = body;
  
  const validation = await validateRequestBody(
    new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(contactData)
    }) as any,
    contactMessageSchema
  );
  
  if (!validation.success) {
    return validation.response;
  }

  const validatedData = validation.data;
  
  try {
    // Obtener información adicional de la solicitud
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrerUrl = request.headers.get('referer') || '';
    
    // Crear nuevo mensaje de contacto
    const newMessage = new ContactMessage({
      ...validatedData,
      ipAddress: clientIP,
      userAgent,
      referrerUrl,
      source: 'website'
    });
    
    await newMessage.save();
    
    // Retornar respuesta sin información sensible
    const responseData = {
      id: newMessage._id,
      name: newMessage.name,
      email: newMessage.email,
      subject: newMessage.subject,
      category: newMessage.category,
      status: newMessage.status,
      createdAt: newMessage.createdAt
    };
    
    const successResponse = createSuccessResponse(
      responseData,
      'Mensaje enviado exitosamente. Te contactaremos pronto.',
      HTTP_STATUS.CREATED
    );
    
    // Add rate limit headers
    addRateLimitHeaders(successResponse.headers, rateLimitResult);
    
    return successResponse;
    
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    throw error;
  }
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
