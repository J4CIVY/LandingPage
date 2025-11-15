import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  try {
    // Verificar permisos de administrador
    const authCheck = await requireAdmin(adminRequest);
    if (authCheck) {
      return authCheck;
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const membershipType = searchParams.get('membershipType') || 'all';
    const status = searchParams.get('status') || 'all';


    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


    // Contar total de usuarios
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);

    // Obtener usuarios con paginación
    const users = await User.find(filters)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


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
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const rawUserData = await req.json();

    // Sanitizar datos de entrada para prevenir XSS
    const { sanitizeApiInput } = await import('@/lib/api-sanitization');
    const userData = sanitizeApiInput(rawUserData, {
      // Información personal
      firstName: 'text',
      lastName: 'text',
      documentType: 'text',
      documentNumber: 'text',
      birthPlace: 'text',
      
      // Contacto
      email: 'email',
      phone: 'phone',
      address: 'text',
      city: 'text',
      country: 'text',
      
      // Información adicional
      binaryGender: 'text',
      bloodType: 'text',
      
      // Contacto de emergencia
      emergencyContactName: 'text',
      emergencyContactRelationship: 'text',
      emergencyContactPhone: 'phone',
      
      // Información de vehículo (si existe)
      vehicleInfo: {
        brand: 'text',
        model: 'text',
        year: 'text',
        plate: 'text',
        color: 'text',
        soatNumber: 'text'
      },
      
      // Password no se sanitiza (se hashea)
      password: 'none'
    });

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
