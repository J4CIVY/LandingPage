import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';
import User from '@/lib/models/User';
import MembershipHistory from '@/lib/models/MembershipHistory';
import bcrypt from 'bcryptjs';

// POST - Solicitar eliminación de cuenta (con periodo de gracia de 30 días)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, confirmText } = body;

    // Validar que se proporcione la contraseña
    if (!password) {
      return NextResponse.json(
        { error: 'Debe proporcionar su contraseña para confirmar' },
        { status: 400 }
      );
    }

    // Validar texto de confirmación
    if (confirmText !== 'eliminar-cuenta') {
      return NextResponse.json(
        { error: 'Debe escribir exactamente "eliminar-cuenta" para confirmar' },
        { status: 400 }
      );
    }

    await dbConnect();

    const userId = authResult.session.userId;

    // Intentar obtener usuario desde ExtendedUser primero
    let user = await ExtendedUser.findById(userId).select('+password');
    
    // Si no existe en ExtendedUser, intentar desde User
    if (!user) {
      user = await User.findById(userId).select('+password');
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña
    if (!user.password) {
      return NextResponse.json(
        { error: 'No se puede verificar la contraseña. Contacte al administrador.' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Verificar si ya tiene una solicitud de eliminación pendiente
    if (user.accountStatus === 'pending_deletion' || user.accountStatus === 'scheduled_deletion') {
      return NextResponse.json(
        { 
          error: 'Ya tienes una solicitud de eliminación pendiente',
          deletionDate: user.scheduledDeletionDate 
        },
        { status: 400 }
      );
    }

    // Cancelar todas las membresías activas
    const activeMemberships = await MembershipHistory.find({
      userId,
      status: 'active'
    });

    for (const membership of activeMemberships) {
      membership.status = 'cancelled';
      membership.cancellationDate = new Date();
      membership.cancellationReason = 'Cuenta eliminada por el usuario';
      membership.cancelledBy = userId;
      await membership.save();
    }

    // Programar eliminación para dentro de 30 días
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Actualizar estado del usuario
    user.accountStatus = 'scheduled_deletion';
    user.scheduledDeletionDate = deletionDate;
    user.isActive = false;
    user.deletionRequestDate = new Date();
    user.deletionReason = 'Usuario solicitó eliminar su cuenta';
    
    // Registrar actividad
    if (user.activities) {
      user.activities.push({
        id: new Date().getTime().toString(),
        type: 'membership_action',
        description: 'Solicitud de eliminación de cuenta',
        details: {
          scheduledDeletionDate: deletionDate,
          cancelledMemberships: activeMemberships.length
        },
        timestamp: new Date(),
        success: true
      });
    }

    await user.save();

    // TODO: Enviar email de confirmación con instrucciones para cancelar la eliminación
    // await sendAccountDeletionEmail(user.email, user.firstName, deletionDate);

    return NextResponse.json({
      success: true,
      message: 'Solicitud de eliminación de cuenta procesada exitosamente',
      data: {
        scheduledDeletionDate: deletionDate,
        gracePeriodDays: 30,
        cancelledMemberships: activeMemberships.length,
        info: 'Tu cuenta será eliminada permanentemente el ' + 
              deletionDate.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) + 
              '. Puedes cancelar esta solicitud iniciando sesión antes de esa fecha.'
      }
    });
  } catch (error) {
    console.error('Error procesando eliminación de cuenta:', error);
    return NextResponse.json(
      { error: 'Error al procesar eliminación de cuenta' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar solicitud de eliminación de cuenta
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = authResult.session.userId;

    // Intentar obtener usuario desde ExtendedUser primero
    let user = await ExtendedUser.findById(userId);
    
    // Si no existe en ExtendedUser, intentar desde User
    if (!user) {
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que tenga una solicitud de eliminación pendiente
    if (user.accountStatus !== 'scheduled_deletion' && user.accountStatus !== 'pending_deletion') {
      return NextResponse.json(
        { error: 'No tienes ninguna solicitud de eliminación pendiente' },
        { status: 400 }
      );
    }

    // Cancelar la eliminación
    user.accountStatus = 'active';
    user.scheduledDeletionDate = undefined;
    user.deletionRequestDate = undefined;
    user.deletionReason = undefined;
    user.isActive = true;

    // Registrar actividad
    if (user.activities) {
      user.activities.push({
        id: new Date().getTime().toString(),
        type: 'membership_action',
        description: 'Cancelación de solicitud de eliminación de cuenta',
        timestamp: new Date(),
        success: true
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Solicitud de eliminación cancelada exitosamente',
      data: {
        accountStatus: user.accountStatus,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error cancelando eliminación de cuenta:', error);
    return NextResponse.json(
      { error: 'Error al cancelar eliminación de cuenta' },
      { status: 500 }
    );
  }
}
