import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// TEMPORAL: Endpoint sin autenticación para diagnosticar
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const membershipType = searchParams.get('membershipType') || 'all';
    const status = searchParams.get('status') || 'all';

    console.log('=== BYPASS USERS ENDPOINT ===');
    console.log('Parámetros:', { page, limit, search, role, membershipType, status });

    // Construir filtros
    const filters: any = {};

    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      filters.role = role;
    }

    if (membershipType !== 'all') {
      filters.membershipType = membershipType;
    }

    if (status !== 'all') {
      filters.isActive = status === 'active';
    }

    console.log('Filtros aplicados:', filters);

    // Contar total de usuarios
    const totalUsers = await User.countDocuments(filters);
    console.log('Total usuarios encontrados:', totalUsers);
    
    const totalPages = Math.ceil(totalUsers / limit);

    // Obtener usuarios con paginación
    const users = await User.find(filters)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Usuarios devueltos:', users.length);

    // Debug: Mostrar algunos usuarios admin
    const adminUsers = await User.find({ role: { $in: ['admin', 'super-admin'] } })
      .select('firstName lastName email role isActive')
      .limit(5);
    
    console.log('Usuarios admin en DB:', adminUsers);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit
      },
      debug: {
        totalInDB: totalUsers,
        adminUsers: adminUsers
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
