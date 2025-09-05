import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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

    console.log('=== TEST USERS ENDPOINT ===');
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

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit
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
