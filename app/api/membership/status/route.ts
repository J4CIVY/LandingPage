import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MembershipHistory from '@/lib/models/MembershipHistory';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET /api/membership/status - Obtener estado actual de membresía del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Buscar la membresía activa más reciente
    const activeMembership = await MembershipHistory.findOne({
      userId: user.id,
      status: 'active'
    }).sort({ endDate: -1 });

    // Buscar información adicional del usuario
    const userDetails = await User.findById(user.id)
      .select('membershipType membershipNumber joinDate isActive');

    if (!userDetails) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let membershipData = null;

    if (activeMembership) {
      // Calcular días restantes
      const now = new Date();
      const endDate = new Date(activeMembership.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Determinar el estado
      let status: 'active' | 'expiring' | 'expired' = 'active';
      if (daysRemaining <= 0) {
        status = 'expired';
      } else if (daysRemaining <= 30) {
        status = 'expiring';
      }

      membershipData = {
        type: activeMembership.membershipType,
        startDate: activeMembership.startDate,
        expirationDate: activeMembership.endDate,
        status,
        daysRemaining: Math.max(0, daysRemaining),
        autoRenewal: activeMembership.isAutoRenewal,
        membershipNumber: activeMembership.membershipNumber,
        paymentStatus: activeMembership.paymentStatus,
        amount: activeMembership.amount,
        currency: activeMembership.currency
      };
    } else {
      // No hay membresía activa, crear datos por defecto
      membershipData = {
        type: userDetails.membershipType || 'friend',
        startDate: userDetails.joinDate || new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde ahora
        status: 'expired' as const,
        daysRemaining: 0,
        autoRenewal: false,
        membershipNumber: userDetails.membershipNumber || 'N/A',
        paymentStatus: 'pending' as const,
        amount: 0,
        currency: 'COP'
      };
    }

    // Estadísticas adicionales
    const [totalRenewals, totalEvents, totalSavings] = await Promise.all([
      MembershipHistory.countDocuments({
        userId: user.id,
        paymentStatus: 'completed'
      }),
      // Aquí podrías agregar una consulta para eventos asistidos si tienes ese modelo
      Promise.resolve(0),
      MembershipHistory.aggregate([
        { $match: { userId: user.id } },
        { $group: { _id: null, total: { $sum: '$totalSavings' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    const stats = {
      totalRenewals,
      totalEvents,
      totalSavings,
      memberSince: userDetails.joinDate,
      isActive: userDetails.isActive
    };

    return NextResponse.json({
      success: true,
      data: {
        membership: membershipData,
        stats,
        user: {
          id: userDetails._id,
          membershipType: userDetails.membershipType,
          membershipNumber: userDetails.membershipNumber,
          isActive: userDetails.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error fetching membership status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/membership/status - Actualizar estado de membresía (renovar, cancelar, etc.)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { action, ...actionData } = await request.json();

    switch (action) {
      case 'renew':
        return await handleRenewal(user, actionData);
      
      case 'cancel':
        return await handleCancellation(user, actionData);
      
      case 'toggle_auto_renewal':
        return await handleAutoRenewalToggle(user, actionData);
      
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating membership status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleRenewal(user: any, data: any) {
  // Implementar lógica de renovación
  // Por ahora retornar un placeholder
  return NextResponse.json({
    success: true,
    message: 'Funcionalidad de renovación será implementada próximamente'
  });
}

async function handleCancellation(user: any, data: any) {
  // Implementar lógica de cancelación
  // Por ahora retornar un placeholder
  return NextResponse.json({
    success: true,
    message: 'Funcionalidad de cancelación será implementada próximamente'
  });
}

async function handleAutoRenewalToggle(user: any, data: any) {
  // Buscar membresía activa
  const activeMembership = await MembershipHistory.findOne({
    userId: user.id,
    status: 'active'
  });

  if (!activeMembership) {
    return NextResponse.json(
      { error: 'No hay membresía activa para modificar' },
      { status: 404 }
    );
  }

  // Actualizar auto renovación
  activeMembership.isAutoRenewal = data.enabled;
  await activeMembership.save();

  return NextResponse.json({
    success: true,
    message: `Auto renovación ${data.enabled ? 'activada' : 'desactivada'} exitosamente`,
    data: {
      isAutoRenewal: activeMembership.isAutoRenewal
    }
  });
}