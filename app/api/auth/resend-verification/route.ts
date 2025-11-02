import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { EmailService } from '@/lib/email-service';
import { z } from 'zod';
import { rateLimit } from '@/utils/rateLimit';
import { requireCSRFToken } from '@/lib/csrf-protection';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resendEmailSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Email inválido')
});

// Rate limiting para reenvío de emails (más restrictivo)
const resendEmailRateLimit = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutos
  uniqueTokenPerInterval: 50
});

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (NEW in Security Audit Phase 2)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Aplicar rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await resendEmailRateLimit.check(clientIP, 3); // 3 intentos por IP cada 5 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos de reenvío. Intenta nuevamente en 5 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validationResult = resendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email inválido',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Buscar usuario por email
    const user = await User.findOne({ 
      email,
      isEmailVerified: false
    });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return NextResponse.json(
        {
          success: true,
          message: 'Si existe una cuenta con este email que no esté verificada, se ha enviado un nuevo correo de verificación.'
        },
        { status: 200 }
      );
    }

    // Generar nuevo token de verificación
    const crypto = await import('crypto');
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Enviar nuevo email de verificación
    try {
      const emailService = new EmailService();
      await emailService.sendEmailVerification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        emailVerificationToken
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Se ha enviado un nuevo correo de verificación. Revisa tu bandeja de entrada.'
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Error enviando el correo de verificación. Intenta nuevamente más tarde.',
          error: 'EMAIL_SEND_ERROR'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error reenviando email de verificación:', error);
    
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
