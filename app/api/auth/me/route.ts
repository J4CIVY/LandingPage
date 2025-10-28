import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Extraer token del header o cookies
    let token = extractTokenFromRequest(request);
    
    if (!token) {
      token = request.cookies.get('bsk-access-token')?.value || null;
    }

    if (!token) {
      // Retornar 200 para evitar error en consola (es esperado no tener sesión)
      return NextResponse.json(
        {
          success: false,
          message: 'Token de acceso no encontrado',
          error: 'NO_TOKEN',
          data: { user: null }
        },
        { status: 200 }
      );
    }

    try {
      // Verificar token
      const payload = verifyAccessToken(token);

      // Verificar que la sesión esté activa
      const session = await Session.findById(payload.sessionId);
      
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        // Retornar 200 para evitar error en consola
        return NextResponse.json(
          {
            success: false,
            message: 'Sesión inválida o expirada',
            error: 'INVALID_SESSION',
            data: { user: null }
          },
          { status: 200 }
        );
      }

      // Buscar usuario
      const user = await User.findById(payload.userId);

      if (!user || !user.isActive) {
        // Retornar 200 para evitar error en consola
        return NextResponse.json(
          {
            success: false,
            message: 'Usuario no encontrado o inactivo',
            error: 'USER_NOT_FOUND',
            data: { user: null }
          },
          { status: 200 }
        );
      }

      // Actualizar última actividad de la sesión
      session.lastUsed = new Date();
      await session.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Perfil obtenido exitosamente',
          data: {
            user: user.getPublicProfile()
          }
        },
        { status: 200 }
      );

    } catch (tokenError) {
      // Retornar 200 para evitar error en consola
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido o expirado',
          error: 'INVALID_TOKEN',
          data: { user: null }
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    
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
