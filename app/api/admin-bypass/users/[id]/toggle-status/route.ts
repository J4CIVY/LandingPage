import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { isActive } = await req.json();
    const { id } = await context.params;

    console.log('=== BYPASS TOGGLE STATUS ===');
    console.log('User ID:', id);
    console.log('New status:', isActive);

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('Usuario actualizado:', user.email, 'Status:', user.isActive);

    return NextResponse.json({
      success: true,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user
    });

  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
