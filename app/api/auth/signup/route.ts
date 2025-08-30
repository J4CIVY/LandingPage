import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Validación de datos del usuario
const UserRegistrationSchema = z.object({
  documentType: z.string().min(1, 'Tipo de documento requerido'),
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido').max(50),
  lastName: z.string().min(1, 'Apellido requerido').max(50),
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  birthPlace: z.string().min(1, 'Lugar de nacimiento requerido'),
  phone: z.string().min(1, 'Teléfono requerido'),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  genderIdentity: z.string().min(1, 'Identidad de género requerida'),
  occupation: z.string().min(1, 'Ocupación requerida'),
  eps: z.string().min(1, 'EPS requerida'),
  emergencyContactName: z.string().min(1, 'Contacto de emergencia requerido'),
  emergencyContactPhone: z.string().min(1, 'Teléfono de emergencia requerido'),
  motorcycleBrand: z.string().optional(),
  motorcycleModel: z.string().optional(),
  motorcycleYear: z.number().optional(),
  motorcyclePlate: z.string().optional(),
  country: z.string().default('Colombia'),
  age: z.number().min(18, 'Debe ser mayor de edad'),
  role: z.string().default('Membresia Friend'),
  temporaryPassword: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  console.log('🚀 API de registro llamada');
  
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const body = await request.json();
    console.log('📝 Datos recibidos:', { ...body, password: '[REDACTED]' });

    // Validar datos
    const validatedData = UserRegistrationSchema.parse(body);
    console.log('✅ Datos validados correctamente');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { documentNumber: validatedData.documentNumber }
      ]
    });

    if (existingUser) {
      console.log('❌ Usuario ya existe');
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Usuario ya registrado con este email o documento' 
        },
        { status: 400 }
      );
    }

    // Crear usuario (el password se hashea automáticamente en el modelo)
    const newUser = new User(validatedData);
    await newUser.save();
    console.log('💾 Usuario guardado en MongoDB:', newUser._id);

    // Respuesta exitosa (password se excluye automáticamente por toJSON)
    return NextResponse.json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('💥 Error en registro:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Datos inválidos',
          errors: error.issues 
        },
        { status: 400 }
      );
    }

    // Error de MongoDB (duplicados, etc.)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Email o documento ya registrado' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Endpoint para obtener usuarios (solo para desarrollo)
export async function GET() {
  console.log('📋 Consultando usuarios en MongoDB');
  
  try {
    await connectDB();
    
    const users = await User.find({})
      .select('-password') // Excluir password explícitamente
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(50); // Limitar resultados
    
    console.log('✅ Usuarios encontrados:', users.length);
    
    return NextResponse.json({
      status: 'success',
      users: users,
      total: users.length
    });
    
  } catch (error) {
    console.error('💥 Error consultando usuarios:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error consultando usuarios' 
      },
      { status: 500 }
    );
  }
}
