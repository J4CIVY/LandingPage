import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import { refreshTokenSchema } from '@/schemas/authSchemas';
import { 
  generateAccessToken, 
  verifyRefreshToken, 
  extractDeviceInfo
} from '@/lib/auth-utils';


export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Obtener refresh token del body o cookies
    let refreshToken: string | undefined;
    
    try {
      const body = await request.json();
      const validationResult = refreshTokenSchema.safeParse(body);
      
      if (validationResult.success) {
        refreshToken = validationResult.data.refreshToken;
      }
    } catch {
      // Si no hay body válido, intentar obtener de cookies
    }

    if (!refreshToken) {
      refreshToken = request.cookies.get('bsk-refresh-token')?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Refresh token no encontrado',
          error: 'NO_REFRESH_TOKEN'
        },
        { status: 401 }
      );
    }

    try {
      // Verificar refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Buscar sesión activa
      const session = await Session.findById(payload.sessionId);

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return NextResponse.json(
          {
            success: false,
            message: 'Sesión inválida o expirada',
            error: 'INVALID_SESSION'
          },
          { status: 401 }
        );
      }

      // Verificar que el refresh token coincida
      if (session.refreshToken !== refreshToken) {
        // Invalidar sesión por seguridad
        await Session.findByIdAndUpdate(session._id, { isActive: false });
        
        return NextResponse.json(
          {
            success: false,
            message: 'Refresh token inválido',
            error: 'INVALID_REFRESH_TOKEN'
          },
          { status: 401 }
        );
      }

      // Buscar usuario
      const user = await User.findById(payload.userId);

      if (!user || !user.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: 'Usuario no encontrado o inactivo',
            error: 'USER_NOT_FOUND'
          },
          { status: 401 }
        );
      }

      // Actualizar información de la sesión
      session.lastUsed = new Date();
      session.deviceInfo = extractDeviceInfo(request);
      await session.save();

      // Generar nuevo access token
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        membershipType: user.membershipType,
        role: user.role,
        sessionId: session._id.toString()
      });

      // Preparar respuesta
      const response = NextResponse.json(
        {
          success: true,
          message: 'Token renovado exitosamente',
          data: {
            user: user.getPublicProfile(),
            expiresIn: 15 * 60
          }
        },
        { status: 200 }
      );

      // Actualizar cookie del access token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 2 * 60 * 60 // 2 horas
      };

      response.cookies.set('bsk-access-token', accessToken, cookieOptions);

      return response;

    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Refresh token inválido o expirado',
          error: 'INVALID_REFRESH_TOKEN'
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error en refresh token:', error);
    
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
