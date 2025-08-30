import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Obtener estadísticas básicas
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Últimos 7 días
    });
    
    // Usuarios por rol
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    return NextResponse.json({
      status: 'success',
      data: {
        database: 'MongoDB Atlas',
        connection: 'active',
        statistics: {
          totalUsers,
          activeUsers,
          recentUsers,
          usersByRole
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('💥 Error obteniendo estadísticas:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error conectando a la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
