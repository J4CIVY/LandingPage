import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { CancelMembershipRequest } from '@/types/membership';
import { requireCSRFToken } from '@/lib/csrf-protection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Cancelar membresía
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener razón de cancelación del body
    const body: CancelMembershipRequest = await request.json();
    const reason = body.reason || 'Sin razón especificada';

    // Verificar si la membresía ya está cancelada
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'La membresía ya está cancelada' },
        { status: 422 }
      );
    }

    // Realizar cancelación suave - marcar como inactivo pero mantener datos
    user.isActive = false;
    user.lastActivity = new Date();
    
    // TODO: Agregar campos para tracking de cancelación
    // user.cancellationDate = new Date();
    // user.cancellationReason = reason;
    
    await user.save();

    // TODO: Crear registro en historial de membresías
    // TODO: Enviar email de confirmación de cancelación
    // TODO: Procesar reembolso si aplica

    return NextResponse.json({
      success: true,
      message: 'Membresía cancelada exitosamente',
      data: {
        cancellationDate: new Date().toISOString(),
        reason: reason,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Error cancelling membership:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}