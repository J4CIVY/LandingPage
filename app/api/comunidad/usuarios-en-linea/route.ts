import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifySession } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET - Obtener usuarios en línea
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuarios que han estado activos en los últimos 15 minutos
    const tiempoLimite = new Date(Date.now() - 15 * 60 * 1000);
    
    const usuariosEnLinea = await User
      .find({
        lastActivity: { $gte: tiempoLimite },
        isActive: true
      })
      .select('firstName lastName email avatar lastActivity')
      .sort({ lastActivity: -1 })
      .limit(50)
      .exec();

    // Transformar datos para el frontend
    const usuariosTransformados = usuariosEnLinea.map((usuario: any) => ({
      id: usuario._id.toString(),
      nombre: `${usuario.firstName} ${usuario.lastName}`,
      avatar: usuario.avatar,
      ultimaActividad: usuario.lastActivity,
      enLinea: true
    }));

    return NextResponse.json({
      exito: true,
      datos: usuariosTransformados,
      mensaje: 'Usuarios en línea obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener usuarios en línea:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Actualizar actividad del usuario (marcar como en línea)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Actualizar última actividad del usuario
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        lastActivity: new Date(),
        isActive: true
      }
    );

    return NextResponse.json({
      exito: true,
      mensaje: 'Actividad actualizada'
    });

  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}