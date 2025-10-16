import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { id } = await context.params;

    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection - Critical admin operation
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) {
    console.error('[SECURITY] CSRF validation failed on admin user update');
    return csrfError;
  }
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { id } = await context.params;
    const updateData = await req.json();

    // Remover campos que no se deben actualizar
    delete updateData._id;
    delete updateData.password;
    delete updateData.emailVerificationToken;
    delete updateData.passwordResetToken;
    delete updateData.createdAt;

    // Actualizar fecha de modificación
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection - Critical admin operation (user deletion)
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) {
    console.error('[SECURITY] CSRF validation failed on admin user deletion');
    return csrfError;
  }
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { id } = await context.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
