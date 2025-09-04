import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireSuperAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  try {
    const { role } = await req.json();
    const { id } = await context.params;

    // Si se intenta asignar super-admin, verificar permisos de super-admin
    if (role === 'super-admin') {
      const superAdminCheck = await requireSuperAdmin(adminRequest);
      if (superAdminCheck) return superAdminCheck;
    } else {
      // Para otros roles, solo requiere admin
      const authCheck = await requireAdmin(adminRequest);
      if (authCheck) return authCheck;
    }

    await connectDB();

    // Verificar que el usuario objetivo existe
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir que admins normales modifiquen super-admins
    if (adminRequest.user?.role === 'admin' && targetUser.role === 'super-admin') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para modificar este usuario' },
        { status: 403 }
      );
    }

    // Actualizar rol
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: `Rol actualizado a ${role} exitosamente`,
      user
    });

  } catch (error) {
    console.error('Error actualizando rol del usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
