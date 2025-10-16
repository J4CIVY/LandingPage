import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import ExtendedUser from '@/lib/models/ExtendedUser';
import { loginSchema } from '@/schemas/authSchemas';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateSecureToken,
  extractDeviceInfo,
  getSessionExpirationDate
} from '@/lib/auth-utils';
import { checkRateLimit, resetRateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyRecaptcha, RecaptchaThresholds, isLikelyHuman } from '@/lib/recaptcha-server';
import { trackSuccessfulLogin, trackFailedLogin } from '@/lib/anomaly-detection';
import { getEmailService } from '@/lib/email-service';
import { checkAndBlockMaliciousIP } from '@/lib/ip-reputation';
import { requireCSRFToken, setCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (NEW in Security Audit Phase 2)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // 1. IP Reputation Check (NEW in v2.5.0)
    const ipCheck = await checkAndBlockMaliciousIP(request);
    
    if (ipCheck.shouldBlock) {
      console.log('[SECURITY] Blocked malicious IP:', ipCheck.reputation);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Acceso denegado por razones de seguridad.',
          error: 'IP_BLOCKED'
        },
        { status: 403 }
      );
    }

    // 1. Enhanced Distributed Rate Limiting (Redis-backed)
    const rateLimitResult = await checkRateLimit(request, RateLimitPresets.LOGIN);
    
    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: `Demasiados intentos de inicio de sesión. Intenta nuevamente en ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.`,
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    // Conectar a la base de datos
    await connectDB();

    // Validar datos de entrada
    const body = await request.json();
    
    // 2. reCAPTCHA v3 Verification
    const recaptchaToken = body.recaptchaToken;
    
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login');
      
      if (!recaptchaResult.success || !isLikelyHuman(recaptchaResult.score, RecaptchaThresholds.LOGIN)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Verificación de seguridad fallida. Por favor, intenta de nuevo.',
            error: 'RECAPTCHA_FAILED',
            riskScore: recaptchaResult.score
          },
          { status: 403 }
        );
      }
    }
    
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Buscar usuario por email (incluir password para verificación)
    const user = await User.findOne({ 
      email,
      isActive: true 
    }).select('+password +loginAttempts +lockUntil +isEmailVerified');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Verificar si el email ha sido verificado
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
          error: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // Verificar si la cuenta está bloqueada
    if (user.isAccountLocked()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos. Intenta nuevamente más tarde.',
          error: 'ACCOUNT_LOCKED'
        },
        { status: 423 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos de login fallidos
      await user.incrementLoginAttempts();
      
      // 3. Track failed login for anomaly detection
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await trackFailedLogin(user._id.toString(), clientIP, userAgent);

      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Login exitoso - resetear intentos fallidos
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Reset rate limit after successful authentication
    await resetRateLimit(request, RateLimitPresets.LOGIN.keyPrefix, user._id.toString());

    // Extraer información del dispositivo
    const deviceInfo = extractDeviceInfo(request);

    // 4. Behavioral Anomaly Detection
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const anomalyResult = await trackSuccessfulLogin(
      user._id.toString(),
      clientIP,
      userAgent,
      { country: 'CO' } // You can integrate geolocation API here
    );
    
    // If high-risk behavior detected, require additional verification
    if (anomalyResult.shouldBlock) {
      return NextResponse.json(
        {
          success: false,
          message: 'Actividad sospechosa detectada. Por favor, verifica tu identidad.',
          error: 'SUSPICIOUS_ACTIVITY',
          reasons: anomalyResult.reasons,
          requiresVerification: true
        },
        { status: 403 }
      );
    }
    
    // Medium risk - allow login but flag for monitoring
    const requiresAdditionalVerification = anomalyResult.requiresVerification;

    // Verificar si es un nuevo dispositivo
    const isNewDevice = await checkIfNewDevice(user._id, deviceInfo);

    // Generar JWT tokens primero (temporales sin sessionId)
    const tempAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      membershipType: user.membershipType,
      role: user.role,
      sessionId: '' // Temporal
    });

    const tempRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: '' // Temporal
    });

    // Crear nueva sesión con el refresh token JWT
    const session = new Session({
      userId: user._id,
      sessionToken: generateSecureToken(),
      refreshToken: tempRefreshToken, // Guardar el JWT temporalmente
      deviceInfo,
      expiresAt: getSessionExpirationDate()
    });

    await session.save();

    // Si es un nuevo dispositivo y el usuario tiene alertas activadas, enviar email
    if (isNewDevice) {
      await sendSecurityAlertIfEnabled(user, deviceInfo);
    }

    // Generar JWT tokens finales con el sessionId correcto
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      membershipType: user.membershipType,
      role: user.role,
      sessionId: session._id.toString()
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: session._id.toString()
    });

    // Actualizar la sesión con el refresh token final
    session.refreshToken = refreshToken;
    await session.save();

    // Actualizar última conexión del usuario
    await user.updateLastLogin();

    // Limpiar sesiones expiradas del usuario (mantener máximo 5 sesiones activas)
    const userSessions = await Session.find({ 
      userId: user._id, 
      isActive: true 
    }).sort({ lastUsed: -1 });

    if (userSessions.length > 5) {
      const sessionsToRemove = userSessions.slice(5);
      await Session.updateMany(
        { _id: { $in: sessionsToRemove.map(s => s._id) } },
        { isActive: false }
      );
    }

    // Preparar respuesta
    const response = NextResponse.json(
      {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: user.getPublicProfile(),
          expiresIn: 15 * 60, // 15 minutos en segundos
          requiresVerification: requiresAdditionalVerification, // Flag for client to show 2FA
          anomalyDetected: anomalyResult.isAnomalous,
          riskScore: anomalyResult.riskScore
        }
      },
      { status: 200 }
    );
    
    // Add rate limit headers to response
    addRateLimitHeaders(response.headers, rateLimitResult);

    // Configurar cookies seguras
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    // Set access token cookie (2 horas para permitir procesos largos como pagos)
    response.cookies.set('bsk-access-token', accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 // 2 horas
    });

    // Set refresh token cookie (7 días)
    response.cookies.set('bsk-refresh-token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    // SECURITY: Generate and set CSRF token for this session
    const csrfToken = setCSRFToken(response);
    console.log('[SECURITY] CSRF token generated for user:', user._id);

    return response;

  } catch (error) {
    console.error('Error en login:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Verifica si el dispositivo es nuevo comparando con sesiones previas
 */
async function checkIfNewDevice(
  userId: any,
  currentDeviceInfo: any
): Promise<boolean> {
  try {
    // Buscar sesiones previas del usuario
    const previousSessions = await Session.find({
      userId,
      isActive: true
    }).limit(10);

    // Si no hay sesiones previas, es un nuevo dispositivo
    if (previousSessions.length === 0) {
      return true;
    }

    // Comparar información del dispositivo actual con sesiones previas
    const deviceSignature = `${currentDeviceInfo.browser}-${currentDeviceInfo.os}-${currentDeviceInfo.device}`;
    
    for (const session of previousSessions) {
      const sessionSignature = `${session.deviceInfo.browser}-${session.deviceInfo.os}-${session.deviceInfo.device}`;
      
      // Si encuentra una coincidencia, no es un nuevo dispositivo
      if (deviceSignature === sessionSignature) {
        return false;
      }
    }

    // Si no encontró coincidencias, es un nuevo dispositivo
    return true;
  } catch (error) {
    console.error('Error verificando nuevo dispositivo:', error);
    // En caso de error, asumir que es nuevo dispositivo por seguridad
    return true;
  }
}

/**
 * Envía alerta de seguridad si el usuario tiene las alertas activadas
 */
async function sendSecurityAlertIfEnabled(
  user: any,
  deviceInfo: any
): Promise<void> {
  try {
    // Buscar configuración de alertas del usuario en ExtendedUser
    const extendedUser = await ExtendedUser.findOne({ email: user.email });

    // Si el usuario tiene alertas desactivadas, no enviar
    if (extendedUser && extendedUser.securityAlerts === false) {
      return;
    }

    // Si no existe en ExtendedUser o tiene alertas activadas (por defecto), enviar alerta
    const emailService = getEmailService();
    const userName = `${user.firstName} ${user.lastName}`;

    await emailService.sendSecurityAlert(
      user.email,
      userName,
      {
        timestamp: new Date().toISOString(),
        ipAddress: deviceInfo.ip,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      }
    );

  } catch (error) {
    console.error('Error enviando alerta de seguridad:', error);
    // No lanzar error para no interrumpir el flujo de login
  }
}
