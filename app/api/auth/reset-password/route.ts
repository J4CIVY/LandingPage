import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { resetPasswordSchema } from '@/schemas/authSchemas';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyRecaptcha, RecaptchaThresholds, isLikelyHuman } from '@/lib/recaptcha-server';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (NEW in Security Audit Phase 2)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // 1. Rate Limiting for Reset Password
    const rateLimitResult = await checkRateLimit(request, {
      maxRequests: 5,
      windowSeconds: 3600, // 1 hour
      keyPrefix: 'ratelimit:reset-password',
    });
    
    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: `Demasiados intentos. Intenta nuevamente en ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.`,
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    await connectDB();

    // Validar datos de entrada
    const body = await request.json();
    
    // 2. reCAPTCHA Verification
    const recaptchaToken = body.recaptchaToken;
    
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'password_reset');
      
      if (!recaptchaResult.success || !isLikelyHuman(recaptchaResult.score, RecaptchaThresholds.PASSWORD_RESET)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Verificación de seguridad fallida.',
            error: 'RECAPTCHA_FAILED'
          },
          { status: 403 }
        );
      }
    }
    
    const validationResult = resetPasswordSchema.safeParse(body);

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

    const { token, password } = validationResult.data;

    // Buscar usuario con el token de restablecimiento
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }, // Token no expirado
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido o expirado'
        },
        { status: 400 }
      );
    }

    // Actualizar la contraseña - el middleware del modelo se encarga del hashing
    user.password = password; // Usar la contraseña sin hashear (el middleware se encarga)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Resetear intentos de login por si estaba bloqueado
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    user.updatedAt = new Date();
    
    await user.save();


    return NextResponse.json(
      {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
