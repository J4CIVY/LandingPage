import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TwoFactorCode from '@/lib/models/TwoFactorCode';
import { generateOTPCode, getOTPExpirationDate, sendOTPToMessageBird } from '@/lib/2fa-utils';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting para generación de OTP
const otpRateLimit = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutos
  uniqueTokenPerInterval: 100
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await otpRateLimit.check(clientIP, 3); // 3 intentos cada 5 minutos
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
    }).select('+password +isEmailVerified');

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

    // Invalidar códigos anteriores no verificados del usuario
    await TwoFactorCode.updateMany(
      { 
        userId: user._id,
        verified: false 
      },
      { 
        expiresAt: new Date() // Expirar inmediatamente
      }
    );

    // Generar nuevo código OTP
    const otpCode = generateOTPCode();
    const expiresAt = getOTPExpirationDate();

    // Extraer información de la sesión
    const sessionInfo = {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      device: request.headers.get('sec-ch-ua-platform') || 'unknown'
    };

    // Guardar código en la base de datos
    const twoFactorCode = new TwoFactorCode({
      userId: user._id,
      code: otpCode,
      phoneNumber: whatsappNumber,
      expiresAt,
      sessionInfo
    });

    await twoFactorCode.save();

    // Enviar código a MessageBird
    const sendResult = await sendOTPToMessageBird(
      otpCode,
      whatsappNumber,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    if (!sendResult.success) {
      console.error('Error al enviar OTP:', sendResult.error);
      
      // No fallar completamente, pero informar al usuario
      return NextResponse.json(
        {
          success: true,
          message: 'Código generado, pero hubo un problema al enviarlo. Por favor contacta soporte.',
          data: {
            twoFactorId: twoFactorCode._id.toString(),
            expiresIn: 300, // 5 minutos en segundos
            phoneNumber: whatsappNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4'),
            sendError: true
          }
        },
        { status: 200 }
      );
    }

    // Limpiar códigos expirados (limpieza periódica)
    TwoFactorCode.cleanupExpiredCodes().catch((err: Error) => 
      console.error('Error limpiando códigos expirados:', err)
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Código de verificación enviado a tu WhatsApp',
        data: {
          twoFactorId: twoFactorCode._id.toString(),
          expiresIn: 300, // 5 minutos en segundos
          phoneNumber: whatsappNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generando código 2FA:', error);
    
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
