import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TwoFactorCode from '@/lib/models/TwoFactorCode';
import PreAuthToken from '@/lib/models/PreAuthToken';
import { generateOTPCode, getOTPExpirationDate, sendOTPToMessageBird } from '@/lib/2fa-utils';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting para generación de OTP
const otpRateLimit = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutos
  uniqueTokenPerInterval: 100
});

export async function POST(request: NextRequest) {
  try {
    // NOTE: CSRF protection is intentionally NOT applied here because:
    // 1. This endpoint is called BEFORE the user has a full session
    // 2. It already has preAuthToken validation (unique per login attempt)
    // 3. It has rate limiting protection
    // 4. The OTP code provides additional verification
    
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await otpRateLimit.check(clientIP, 5); // 5 intentos cada 5 minutos (aumentado para reenvíos)
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
    const { preAuthToken } = body;

    if (!preAuthToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de pre-autenticación requerido',
          error: 'MISSING_PRE_AUTH_TOKEN'
        },
        { status: 400 }
      );
    }

    // Buscar y validar token de pre-autenticación
    const preAuthTokenDoc = await PreAuthToken.findOne({ 
      token: preAuthToken
    }).populate('userId');

    if (!preAuthTokenDoc) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido o expirado',
          error: 'INVALID_PRE_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    // Verificar si el token es válido
    if (!preAuthTokenDoc.isValid()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token expirado. Por favor inicia sesión nuevamente.',
          error: 'PRE_AUTH_TOKEN_EXPIRED'
        },
        { status: 401 }
      );
    }

    // Verificar que la IP coincida (seguridad adicional)
    const currentIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (preAuthTokenDoc.sessionInfo.ip !== currentIP) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sesión inválida. Por favor inicia sesión nuevamente.',
          error: 'IP_MISMATCH'
        },
        { status: 401 }
      );
    }

    const user = preAuthTokenDoc.userId as any;

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado o inactivo',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
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
