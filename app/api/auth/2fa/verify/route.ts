import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import TwoFactorCode from '@/lib/models/TwoFactorCode';
import PreAuthToken from '@/lib/models/PreAuthToken';
import { isValidOTPFormat } from '@/lib/2fa-utils';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateSecureToken,
  extractDeviceInfo,
  getSessionExpirationDate
} from '@/lib/auth-utils';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting para verificación de OTP
const verifyRateLimit = rateLimit({
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
      await verifyRateLimit.check(clientIP, 10); // 10 intentos cada 5 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos de verificación. Por favor espera.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { twoFactorId, code, preAuthToken } = body;

    // Validar entrada
    if (!twoFactorId || !code) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID de verificación y código son requeridos',
          error: 'MISSING_DATA'
        },
        { status: 400 }
      );
    }

    // Validar formato del código
    if (!isValidOTPFormat(code)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Formato de código inválido',
          error: 'INVALID_CODE_FORMAT'
        },
        { status: 400 }
      );
    }

    // Si se proporciona preAuthToken, validarlo y marcarlo como usado
    if (preAuthToken) {
      const preAuthTokenDoc = await PreAuthToken.findOne({ token: preAuthToken });
      
      if (preAuthTokenDoc && preAuthTokenDoc.isValid()) {
        await preAuthTokenDoc.markAsUsed();
      }
    }

    // Buscar el código 2FA
    const twoFactorCode = await TwoFactorCode.findById(twoFactorId)
      .select('+code')
      .populate('userId');

    if (!twoFactorCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Código de verificación no encontrado',
          error: 'CODE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verificar si ya fue verificado
    if (twoFactorCode.verified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Este código ya fue utilizado',
          error: 'CODE_ALREADY_USED'
        },
        { status: 400 }
      );
    }

    // Verificar si expiró
    if (twoFactorCode.isExpired()) {
      return NextResponse.json(
        {
          success: false,
          message: 'El código ha expirado. Solicita uno nuevo.',
          error: 'CODE_EXPIRED'
        },
        { status: 400 }
      );
    }

    // Verificar intentos excedidos
    if (twoFactorCode.hasExceededAttempts()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Has excedido el número máximo de intentos. Solicita un nuevo código.',
          error: 'MAX_ATTEMPTS_EXCEEDED'
        },
        { status: 400 }
      );
    }

    // Verificar el código (case insensitive)
    const isCodeValid = twoFactorCode.code.toUpperCase() === code.toUpperCase();

    if (!isCodeValid) {
      await twoFactorCode.incrementAttempts();
      
      const remainingAttempts = twoFactorCode.maxAttempts - twoFactorCode.attempts - 1;
      
      return NextResponse.json(
        {
          success: false,
          message: `Código incorrecto. Te quedan ${remainingAttempts} ${remainingAttempts === 1 ? 'intento' : 'intentos'}`,
          error: 'INVALID_CODE',
          remainingAttempts
        },
        { status: 401 }
      );
    }

    // Código válido - marcar como verificado
    await twoFactorCode.markAsVerified();

    // Obtener el usuario
    const user = await User.findById(twoFactorCode.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Resetear intentos de login si existían
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Extraer información del dispositivo
    const deviceInfo = extractDeviceInfo(request);

    // Generar JWT tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      membershipType: user.membershipType,
      role: user.role,
      sessionId: '' // Temporal, se actualizará después de crear la sesión
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: '' // Temporal, se actualizará después de crear la sesión
    });

    // Crear nueva sesión con el refreshToken JWT
    const session = new Session({
      userId: user._id,
      sessionToken: generateSecureToken(),
      refreshToken: refreshToken, // Guardar el JWT
      deviceInfo,
      expiresAt: getSessionExpirationDate()
    });

    await session.save();

    // Regenerar tokens con el sessionId correcto
    const finalAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      membershipType: user.membershipType,
      role: user.role,
      sessionId: session._id.toString()
    });

    const finalRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: session._id.toString()
    });

    // Actualizar la sesión con el refresh token final
    session.refreshToken = finalRefreshToken;
    await session.save();

    // Actualizar última conexión
    await user.updateLastLogin();

    // Limpiar sesiones antiguas (mantener máximo 5)
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
        message: 'Autenticación exitosa',
        data: {
          user: user.getPublicProfile(),
          accessToken: finalAccessToken,
          refreshToken: finalRefreshToken,
          expiresIn: 15 * 60 // 15 minutos
        }
      },
      { status: 200 }
    );

    // Configurar cookies seguras
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    response.cookies.set('bsk-access-token', finalAccessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 // 2 horas
    });

    response.cookies.set('bsk-refresh-token', finalRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Error verificando código 2FA:', error);
    
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
