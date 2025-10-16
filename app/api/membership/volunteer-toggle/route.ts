import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { VolunteerToggleRequest } from '@/types/membership';
import { requireCSRFToken } from '@/lib/csrf-protection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Activar/Desactivar rol de voluntario
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
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

    // Obtener datos de la solicitud
    const body: VolunteerToggleRequest = await request.json();
    const { enable } = body;

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Solo miembros activos pueden ser voluntarios' },
        { status: 422 }
      );
    }

    // Actualizar estado de voluntario
    user.volunteer = enable;
    user.lastActivity = new Date();
    
    // TODO: Si se está desactivando y el usuario es Leader, verificar lógica de negocio
    // Los Leaders deben mantener el rol de voluntario
    
    await user.save();

    // TODO: Actualizar beneficios del usuario
    // TODO: Notificar al equipo de voluntarios
    // TODO: Registrar en historial de actividades

    const message = enable 
      ? '¡Te has registrado como voluntario! Ahora tendrás acceso a beneficios adicionales.'
      : 'Has desactivado tu rol de voluntario. Puedes reactivarlo cuando desees.';

    return NextResponse.json({
      success: true,
      message,
      data: {
        volunteer: enable,
        effectiveDate: new Date().toISOString(),
        additionalBenefits: enable ? [
          'Reconocimiento especial en eventos',
          'Acceso prioritario a capacitaciones',
          'Certificaciones de voluntariado',
          'Puntos adicionales por actividades'
        ] : []
      }
    });

  } catch (error) {
    console.error('Error toggling volunteer status:', error);
    
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