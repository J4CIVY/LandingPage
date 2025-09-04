import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Product from '@/lib/models/Product';
import MembershipApplication from '@/lib/models/MembershipApplication';
import Emergency from '@/lib/models/Emergency';

export async function GET(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    // Obtener estadísticas de usuarios
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Obtener estadísticas de eventos
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() }
    });

    // Obtener estadísticas de productos
    const totalProducts = await Product.countDocuments();

    // Obtener estadísticas de membresías
    const totalMemberships = await MembershipApplication.countDocuments();
    const pendingMemberships = await MembershipApplication.countDocuments({
      status: 'pending'
    });

    // Obtener emergencias activas
    let emergencies = 0;
    try {
      emergencies = await Emergency.countDocuments({
        status: 'active'
      });
    } catch (error) {
      // Si el modelo Emergency no existe, continuamos con 0
      console.log('Modelo Emergency no encontrado, usando 0');
    }

    const stats = {
      totalUsers,
      activeUsers,
      totalEvents,
      upcomingEvents,
      totalProducts,
      totalMemberships,
      pendingMemberships,
      emergencies
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del admin:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
