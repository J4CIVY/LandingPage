import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/lib/models/Session';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (NEW in Security Audit Phase 2)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();

    // Extraer token del header o cookies
    let token = extractTokenFromRequest(request);
    
    if (!token) {
      // Intentar obtener de las cookies
      token = request.cookies.get('bsk-access-token')?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de acceso no encontrado',
          error: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    try {
      // Verificar y decodificar el token
      const payload = verifyAccessToken(token);

      // Invalidar la sesión específica
      await Session.findByIdAndUpdate(
        payload.sessionId,
        { 
          isActive: false,
          lastUsed: new Date()
        }
      );

      // Crear respuesta
      const response = NextResponse.json(
        {
          success: true,
          message: 'Sesión cerrada exitosamente'
        },
        { status: 200 }
      );

      // Limpiar cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0
      };

      response.cookies.set('bsk-access-token', '', cookieOptions);
      response.cookies.set('bsk-refresh-token', '', cookieOptions);

      return response;

    } catch {
      // Token inválido o expirado, pero aún así limpiamos las cookies
      const response = NextResponse.json(
        {
          success: true,
          message: 'Sesión cerrada exitosamente'
        },
        { status: 200 }
      );

      // Limpiar cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0
      };

      response.cookies.set('bsk-access-token', '', cookieOptions);
      response.cookies.set('bsk-refresh-token', '', cookieOptions);

      return response;
    }

  } catch (error) {
    console.error('Error en logout:', error);
    
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
