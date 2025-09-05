import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Obtener todos los usuarios sin filtros para debugging
    const allUsers = await User.find({})
      .select('firstName lastName email role membershipType isActive createdAt')
      .limit(10);

    console.log('=== DEBUG USERS ===');
    console.log('Total usuarios encontrados:', allUsers.length);
    console.log('Usuarios:', allUsers);
    
    // Obtener estadísticas
    const totalUsers = await User.countDocuments({});
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const superAdminUsers = await User.countDocuments({ role: 'super-admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    return NextResponse.json({
      success: true,
      debug: true,
      stats: {
        total: totalUsers,
        admin: adminUsers,
        superAdmin: superAdminUsers,
        regular: regularUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      sampleUsers: allUsers
    });

  } catch (error) {
    console.error('Error en debug de usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
