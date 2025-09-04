import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const event = await Event.findById(params.id)
      .populate('participants', 'firstName lastName email membershipType')
      .populate('createdBy', 'firstName lastName email');

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Error obteniendo evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const eventData = await req.json();

    const event = await Event.findByIdAndUpdate(
      params.id,
      { 
        ...eventData,
        updatedBy: adminRequest.user?.id,
        updatedAt: new Date()
      },
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
      message: 'Evento actualizado exitosamente',
      event
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const event = await Event.findByIdAndDelete(params.id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
