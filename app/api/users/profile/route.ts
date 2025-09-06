import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener perfil del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId)
      .select('-password') // Excluir la contraseña
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: (user as any)._id,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          email: (user as any).email,
          phone: (user as any).phone,
          address: (user as any).address,
          city: (user as any).city,
          country: (user as any).country,
          dateOfBirth: (user as any).birthDate,
          motorcycleInfo: {
            brand: (user as any).motorcycleBrand || '',
            model: (user as any).motorcycleModel || '',
            year: (user as any).motorcycleYear || '',
            licensePlate: (user as any).motorcyclePlate || ''
          },
          emergencyContact: {
            name: (user as any).emergencyContactName || '',
            phone: (user as any).emergencyContactPhone || '',
            relationship: (user as any).emergencyContactRelationship || ''
          },
          membershipType: (user as any).membershipType,
          isEmailVerified: (user as any).isEmailVerified,
          createdAt: (user as any).createdAt,
          updatedAt: (user as any).updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error en GET /api/users/profile:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      country,
      dateOfBirth,
      motorcycleInfo,
      emergencyContact
    } = body;

    // Validaciones básicas
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, message: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en otro usuario
    if (email !== decoded.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: decoded.userId } 
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Este email ya está registrado por otro usuario' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualización
    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || '',
      country: country?.trim() || '',
      birthDate: dateOfBirth || null,
      motorcycleBrand: motorcycleInfo?.brand?.trim() || '',
      motorcycleModel: motorcycleInfo?.model?.trim() || '',
      motorcycleYear: motorcycleInfo?.year?.trim() || '',
      motorcyclePlate: motorcycleInfo?.licensePlate?.trim() || '',
      emergencyContactName: emergencyContact?.name?.trim() || '',
      emergencyContactPhone: emergencyContact?.phone?.trim() || '',
      emergencyContactRelationship: emergencyContact?.relationship?.trim() || '',
      updatedAt: new Date()
    };

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Excluir la contraseña
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          country: updatedUser.country,
          dateOfBirth: updatedUser.birthDate,
          motorcycleInfo: {
            brand: updatedUser.motorcycleBrand || '',
            model: updatedUser.motorcycleModel || '',
            year: updatedUser.motorcycleYear || '',
            licensePlate: updatedUser.motorcyclePlate || ''
          },
          emergencyContact: {
            name: updatedUser.emergencyContactName || '',
            phone: updatedUser.emergencyContactPhone || '',
            relationship: updatedUser.emergencyContactRelationship || ''
          },
          membershipType: updatedUser.membershipType,
          isEmailVerified: updatedUser.isEmailVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error en PUT /api/users/profile:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Datos de perfil inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
