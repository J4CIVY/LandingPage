import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import { loginSchema } from '@/schemas/authSchemas';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateSecureToken,
  extractDeviceInfo,
  getSessionExpirationDate
} from '@/lib/auth-utils';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting específico para login (más restrictivo)
const loginRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 100 // 100 IPs diferentes por intervalo
});

export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await loginRateLimit.check(clientIP, 5); // 5 intentos por IP cada 15 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Validar datos de entrada
    const body = await request.json();
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
    }).select('+password +loginAttempts +lockUntil');

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

    // Extraer información del dispositivo
    const deviceInfo = extractDeviceInfo(request);

    // Generar tokens únicos para la sesión
    const sessionToken = generateSecureToken();
    const refreshTokenValue = generateSecureToken();

    // Crear nueva sesión
    const session = new Session({
      userId: user._id,
      sessionToken,
      refreshToken: refreshTokenValue,
      deviceInfo,
      expiresAt: getSessionExpirationDate()
    });

    await session.save();

    // Generar JWT tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      membershipType: user.membershipType,
      sessionId: session._id.toString()
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: session._id.toString()
    });

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
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 // 15 minutos en segundos
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

    // Set access token cookie (15 minutos)
    response.cookies.set('bsk-access-token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 // 15 minutos
    });

    // Set refresh token cookie (7 días)
    response.cookies.set('bsk-refresh-token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

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
