import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { isActive } = await req.json();
    const { id } = await context.params;

    const event = await Event.findByIdAndUpdate(
      id,
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
