import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Validación de datos del usuario - Compatible con el frontend
const UserRegistrationSchema = z.object({
  // Información personal básica
  documentType: z.string().min(1, 'Tipo de documento requerido'),
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido').max(50),
  lastName: z.string().min(1, 'Apellido requerido').max(50),
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  birthPlace: z.string().min(1, 'Lugar de nacimiento requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  
  // Información de contacto
  phone: z.string().min(1, 'Teléfono requerido'),
  whatsapp: z.string().optional(),
  address: z.string().min(1, 'Dirección requerida'),
  neighborhood: z.string().optional(),
  city: z.string().min(1, 'Ciudad requerida'),
  country: z.string().default('Colombia'),
  postalCode: z.string().optional(),
  
  // Información de género e identidad
  binaryGender: z.string().min(1, 'Género requerido'),
  genderIdentity: z.string().optional(),
  
  // Información profesional y salud
  occupation: z.string().optional(),
  discipline: z.string().optional(),
  bloodType: z.string().optional(),
  rhFactor: z.string().optional(),
  allergies: z.string().optional(),
  healthInsurance: z.string().optional(),
  
  // Contacto de emergencia
  emergencyContactName: z.string().min(1, 'Contacto de emergencia requerido'),
  emergencyContactRelationship: z.string().min(1, 'Relación de contacto de emergencia requerida'),
  emergencyContactPhone: z.string().min(1, 'Teléfono de emergencia requerido'),
  emergencyContactNeighborhood: z.string().optional(),
  emergencyContactCity: z.string().min(1, 'Ciudad de contacto de emergencia requerida'),
  emergencyContactCountry: z.string().min(1, 'País de contacto de emergencia requerido'),
  
  // Información de motocicleta
  motorcyclePlate: z.string().min(1, 'Placa de motocicleta requerida'),
  motorcycleBrand: z.string().min(1, 'Marca de motocicleta requerida'),
  motorcycleModel: z.string().min(1, 'Modelo de motocicleta requerido'),
  motorcycleYear: z.string().min(1, 'Año de motocicleta requerido'),
  motorcycleDisplacement: z.string().min(1, 'Cilindraje de motocicleta requerido'),
  
  // Campos de consentimiento
  dataConsent: z.boolean().refine(val => val === true, 'Debe aceptar el tratamiento de datos'),
  liabilityWaiver: z.boolean().refine(val => val === true, 'Debe aceptar la exención de responsabilidad'),
  termsAcceptance: z.boolean().refine(val => val === true, 'Debe aceptar los términos y condiciones'),
  
  // Campos calculados/automáticos
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
