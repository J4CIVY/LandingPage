import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export interface AdminRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Middleware para verificar autenticación de administradores
 */
export async function requireAdmin(req: AdminRequest): Promise<NextResponse | null> {
  try {
    // Debug: Ver todas las cookies disponibles
    const allCookies = req.cookies.getAll();
    console.log('=== AUTH DEBUG ===');
    console.log('Todas las cookies:', allCookies.map(c => c.name));
    
    const token = req.cookies.get('bsk-access-token')?.value;
    console.log('Token bsk-access-token encontrado:', !!token);
    
    // Buscar token con nombres alternativos
    const alternativeToken = req.cookies.get('access-token')?.value || 
                           req.cookies.get('auth-token')?.value ||
                           req.cookies.get('token')?.value;
    console.log('Token alternativo encontrado:', !!alternativeToken);
    
    const finalToken = token || alternativeToken;
    
    if (!finalToken) {
      console.log('ERROR: No se encontró ningún token');
      return NextResponse.json(
        { success: false, error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    console.log('JWT_SECRET presente:', !!process.env.JWT_SECRET);
    console.log('Token a verificar (primeros 20 chars):', finalToken.substring(0, 20));

    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET!) as any;
    console.log('Token decodificado exitosamente:', { userId: decoded.userId, exp: decoded.exp });
    
    await connectDB();
    
    // Buscar usuario con diferentes métodos
    const user = await User.findById(decoded.userId);
    console.log('Usuario encontrado:', !!user);
    
    if (user) {
      console.log('Datos del usuario:', {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName
      });
    }
    
    if (!user || !user.isActive) {
      console.log('ERROR: Usuario no encontrado o inactivo');
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'super-admin') {
      console.log('ERROR: Usuario no es admin. Rol actual:', user.role);
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    console.log('AUTH SUCCESS: Usuario autorizado como admin');

    // Agregar información del usuario a la request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return null; // Continuar con la request
  } catch (error) {
    console.error('Error en autenticación de admin:', error);
    
    // Más detalles sobre el error
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('JWT Error específico:', error.message);
      return NextResponse.json(
        { success: false, error: `Token JWT inválido: ${error.message}` },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expirado');
      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error de autenticación' },
      { status: 401 }
    );
  }
}

/**
 * Middleware para verificar si el usuario es super-admin
 */
export async function requireSuperAdmin(req: AdminRequest): Promise<NextResponse | null> {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  if (req.user?.role !== 'super-admin') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Se requieren permisos de super-administrador' },
      { status: 403 }
    );
  }

  return null;
}
