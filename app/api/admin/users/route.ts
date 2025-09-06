import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  console.log('🔍 Admin users GET request started');
  const adminRequest = req as AdminRequest;
  
  try {
    // Verificar permisos de administrador
    console.log('🛡️ Checking admin permissions...');
    const authCheck = await requireAdmin(adminRequest);
    if (authCheck) {
      console.log('❌ Admin auth failed');
      return authCheck;
    }
    console.log('✅ Admin auth passed');

    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const membershipType = searchParams.get('membershipType') || 'all';
    const status = searchParams.get('status') || 'all';

    console.log('📋 Query params:', { page, limit, search, role, membershipType, status });

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

    console.log('🔍 Applied filters:', JSON.stringify(filters));

    // Contar total de usuarios
    console.log('📊 Counting total users...');
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);
    console.log(`📊 Found ${totalUsers} users, ${totalPages} pages`);

    // Obtener usuarios con paginación
    console.log('👥 Fetching users...');
    const users = await User.find(filters)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log(`✅ Retrieved ${users.length} users`);

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
    console.error('❌ Error in admin users GET:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const userData = await req.json();

    // Validar datos requeridos
    const requiredFields = [
      'documentType', 'documentNumber', 'firstName', 'lastName',
      'birthDate', 'birthPlace', 'phone', 'email', 'address',
      'city', 'country', 'binaryGender', 'emergencyContactName',
      'emergencyContactRelationship', 'emergencyContactPhone',
      'password'
    ];

    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { success: false, error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const newUser = new User({
      ...userData,
      isEmailVerified: true, // Los usuarios creados por admin están verificados
      role: userData.role || 'user',
      isActive: true
    });

    await newUser.save();

    // Remover información sensible
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
