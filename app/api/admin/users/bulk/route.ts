import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { userIds, action } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere una lista de IDs de usuarios' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Usuarios activados exitosamente';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Usuarios desactivados exitosamente';
        break;
      case 'export':
        // Para exportar, devolvemos los datos de los usuarios
        const users = await User.find({ _id: { $in: userIds } })
          .select('-password -emailVerificationToken -passwordResetToken');
        
        return NextResponse.json({
          success: true,
          data: users,
          message: 'Datos de usuarios exportados'
        });
      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error en acción masiva:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
