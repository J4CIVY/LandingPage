import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireCSRFToken } from '@/lib/csrf-protection';

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Renovar membresía
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

    // Verificar si puede renovar (dentro de 60 días del vencimiento)
    const currentDate = new Date();
    const joinDate = user.joinDate || user.createdAt;
    const currentExpiryDate = new Date(joinDate);
    currentExpiryDate.setFullYear(currentExpiryDate.getFullYear() + 1);
    
    const daysUntilExpiry = Math.ceil((currentExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry > 60) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Aún tienes ${daysUntilExpiry} días antes de poder renovar. Puedes renovar 60 días antes del vencimiento.` 
        },
        { status: 422 }
      );
    }

    // Extender la membresía por un año más
    const newExpiryDate = new Date(currentExpiryDate);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    
    // Actualizar información del usuario
    user.membershipExpiry = newExpiryDate;
    user.lastActivity = currentDate;
    await user.save();

    // TODO: Crear registro en historial de membresías
    // TODO: Procesar pago si es necesario
    // TODO: Enviar confirmación por email

    return NextResponse.json({
      success: true,
      message: 'Membresía renovada exitosamente',
      data: {
        newExpiryDate: newExpiryDate.toISOString(),
        membershipType: user.membershipType,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error renewing membership:', error);
    
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