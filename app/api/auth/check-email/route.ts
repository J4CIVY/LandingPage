import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';
import { rateLimit } from '@/utils/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting para verificación de emails (previene enumeración)
const checkEmailRateLimit = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutos
  uniqueTokenPerInterval: 500
});

// Schema de validación
const checkEmailSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Email inválido')
});

/**
 * POST /api/auth/check-email
 * Verifica si un email existe en el sistema (sin revelar información sensible)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting para prevenir enumeración de usuarios
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    try {
      await checkEmailRateLimit.check(clientIP, 10); // 10 verificaciones cada 5 minutos
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiados intentos. Por favor espera unos minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validar entrada
    const validation = checkEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email inválido',
          errors: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Conectar a la base de datos
    await connectDB();

    // Buscar usuario por email (case-insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('email isEmailVerified').lean();

    // Si el usuario no existe
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se encontró una cuenta con este correo electrónico.',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verificar que user tenga las propiedades necesarias
    if (!user || typeof user !== 'object' || !('email' in user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error al verificar el email'
        },
        { status: 500 }
      );
    }

    // Si el email no está verificado
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
          code: 'EMAIL_NOT_VERIFIED',
          data: {
            email: user.email
          }
        },
        { status: 403 }
      );
    }

    // Email existe y está verificado
    return NextResponse.json(
      {
        success: true,
        message: 'Email verificado',
        data: {
          email: user.email,
          exists: true,
          verified: true
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en check-email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al verificar el email. Por favor intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}
