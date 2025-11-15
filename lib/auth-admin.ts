/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const token = req.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

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
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Token JWT inválido' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
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
