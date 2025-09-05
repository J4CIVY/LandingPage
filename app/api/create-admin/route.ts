import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, firstName, lastName } = await req.json();

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ 
      $or: [
        { role: 'admin' },
        { role: 'super-admin' },
        { email }
      ]
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un administrador o el email está en uso' },
        { status: 400 }
      );
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminUser = new User({
      documentType: 'CC',
      documentNumber: '00000000',
      firstName,
      lastName,
      birthDate: '1990-01-01',
      birthPlace: 'Admin',
      phone: '0000000000',
      email,
      address: 'Admin Address',
      city: 'Admin City',
      country: 'Colombia',
      binaryGender: 'Masculino',
      emergencyContactName: 'Admin Contact',
      emergencyContactRelationship: 'Admin',
      emergencyContactPhone: '0000000000',
      password: hashedPassword,
      role: 'super-admin',
      membershipType: 'pro',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Administrador creado exitosamente',
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando administrador:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}