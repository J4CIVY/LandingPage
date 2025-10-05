import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PreAuthToken from '@/lib/models/PreAuthToken';
import { generateSecureToken } from '@/lib/auth-utils';
import { rateLimit } from '@/utils/rateLimit';
import crypto from 'crypto';

// Rate limiting para validación de credenciales
const validateRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 100
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await validateRateLimit.check(clientIP, 5); // 5 intentos cada 15 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos. Por favor espera 15 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email y contraseña son requeridos',
          error: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findOne({ 
      email,
      isActive: true 
    }).select('+password +isEmailVerified +loginAttempts +lockUntil');

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

    // Verificar email
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión',
          error: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // Verificar cuenta bloqueada
    if (user.isAccountLocked()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cuenta temporalmente bloqueada. Intenta más tarde.',
          error: 'ACCOUNT_LOCKED'
        },
        { status: 423 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga número de WhatsApp
    const whatsappNumber = user.whatsapp || user.phone;
    
    if (!whatsappNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes un número de WhatsApp configurado. Por favor actualiza tu perfil.',
          error: 'NO_WHATSAPP_NUMBER'
        },
        { status: 400 }
      );
    }

    // Invalidar tokens de pre-autenticación anteriores del usuario
    await PreAuthToken.updateMany(
      { 
        userId: user._id,
        used: false 
      },
      { 
        expiresAt: new Date() // Expirar inmediatamente
      }
    );

    // Generar token de pre-autenticación seguro
    const preAuthToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Extraer información de la sesión
    const sessionInfo = {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      device: request.headers.get('sec-ch-ua-platform') || 'unknown'
    };

    // Guardar token en la base de datos
    const preAuthTokenDoc = new PreAuthToken({
      userId: user._id,
      token: preAuthToken,
      sessionInfo,
      expiresAt
    });

    await preAuthTokenDoc.save();

    // Resetear intentos fallidos de login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Credenciales validadas correctamente',
        data: {
          preAuthToken,
          expiresIn: 300, // 5 minutos en segundos
          userId: user._id.toString(),
          email: user.email,
          requiresTwoFactor: true
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error validando credenciales:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
