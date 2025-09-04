import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { isActive } = await req.json();

    const event = await Event.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Evento ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      event
    });

  } catch (error) {
    console.error('Error actualizando estado del evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
