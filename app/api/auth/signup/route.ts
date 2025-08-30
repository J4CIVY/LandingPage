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
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Dirección requerida'),
  neighborhood: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'Ciudad requerida'),
  country: z.string().default('Colombia'),
  postalCode: z.string().optional().or(z.literal('')),
  
  // Información de género e identidad
  binaryGender: z.string().min(1, 'Género requerido'),
  genderIdentity: z.string().optional().or(z.literal('')),
  
  // Información profesional y salud
  occupation: z.string().optional().or(z.literal('')),
  discipline: z.string().optional().or(z.literal('')),
  bloodType: z.string().optional().or(z.literal('')),
  rhFactor: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  healthInsurance: z.string().optional().or(z.literal('')),
  
  // Contacto de emergencia
  emergencyContactName: z.string().min(1, 'Contacto de emergencia requerido'),
  emergencyContactRelationship: z.string().min(1, 'Relación de contacto de emergencia requerida'),
  emergencyContactPhone: z.string().min(1, 'Teléfono de emergencia requerido'),
  emergencyContactNeighborhood: z.string().optional().or(z.literal('')),
  emergencyContactCity: z.string().min(1, 'Ciudad de contacto de emergencia requerida'),
  emergencyContactCountry: z.string().min(1, 'País de contacto de emergencia requerido'),
  
  // Información de motocicleta
  motorcyclePlate: z.string().min(1, 'Placa de motocicleta requerida'),
  motorcycleBrand: z.string().min(1, 'Marca de motocicleta requerida'),
  motorcycleModel: z.string().min(1, 'Modelo de motocicleta requerido'),
  motorcycleYear: z.string().min(1, 'Año de motocicleta requerido'),
  motorcycleDisplacement: z.string().min(1, 'Cilindraje de motocicleta requerido'),
  
  // Campos de consentimiento - más flexibles para manejar diferentes tipos
  dataConsent: z.union([z.boolean(), z.string()]).transform(val => {
    if (typeof val === 'string') return val === 'true' || val === '1';
    return Boolean(val);
  }).refine(val => val === true, 'Debe aceptar el tratamiento de datos'),
  
  liabilityWaiver: z.union([z.boolean(), z.string()]).transform(val => {
    if (typeof val === 'string') return val === 'true' || val === '1';
    return Boolean(val);
  }).refine(val => val === true, 'Debe aceptar la exención de responsabilidad'),
  
  termsAcceptance: z.union([z.boolean(), z.string()]).transform(val => {
    if (typeof val === 'string') return val === 'true' || val === '1';
    return Boolean(val);
  }).refine(val => val === true, 'Debe aceptar los términos y condiciones'),
  
  // Campos calculados/automáticos
  age: z.number().min(18, 'Debe ser mayor de edad'),
  role: z.string().default('Membresia Friend'),
  temporaryPassword: z.boolean().default(false)
}).transform(data => {
  // Limpiar campos opcionales que vengan como string vacío
  return {
    ...data,
    whatsapp: data.whatsapp || undefined,
    neighborhood: data.neighborhood || undefined,
    postalCode: data.postalCode || undefined,
    genderIdentity: data.genderIdentity || undefined,
    occupation: data.occupation || undefined,
    discipline: data.discipline || undefined,
    bloodType: data.bloodType || undefined,
    rhFactor: data.rhFactor || undefined,
    allergies: data.allergies || undefined,
    healthInsurance: data.healthInsurance || undefined,
    emergencyContactNeighborhood: data.emergencyContactNeighborhood || undefined
  };
});

export async function POST(request: NextRequest) {
  console.log('🚀 API de registro llamada - Timestamp:', new Date().toISOString());
  
  try {
    // Conectar a la base de datos
    console.log('📡 Intentando conectar a MongoDB...');
    await connectDB();
    console.log('✅ Conectado exitosamente a MongoDB');

    // Obtener y validar el body
    let body;
    try {
      body = await request.json();
      console.log('📝 Datos recibidos:', { 
        ...body, 
        password: '[REDACTED]',
        dataKeysCount: Object.keys(body).length,
        dataKeys: Object.keys(body)
      });
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Datos JSON inválidos',
          error: parseError instanceof Error ? parseError.message : 'Error desconocido'
        },
        { status: 400 }
      );
    }

    // Validar datos con Zod
    let validatedData;
    try {
      console.log('🔍 Validando datos con Zod...');
      validatedData = UserRegistrationSchema.parse(body);
      console.log('✅ Datos validados correctamente');
    } catch (zodError) {
      console.error('❌ Error de validación Zod:', zodError);
      if (zodError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Datos inválidos',
            errors: zodError.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              received: issue.input
            }))
          },
          { status: 400 }
        );
      }
      throw zodError;
    }

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { documentNumber: validatedData.documentNumber }
      ]
    });

    if (existingUser) {
      console.log('❌ Usuario ya existe:', { 
        email: existingUser.email, 
        documentNumber: existingUser.documentNumber 
      });
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Usuario ya registrado con este email o documento' 
        },
        { status: 400 }
      );
    }

    // Crear usuario (el password se hashea automáticamente en el modelo)
    console.log('👤 Creando nuevo usuario...');
    const newUser = new User(validatedData);
    
    console.log('💾 Guardando usuario en MongoDB...');
    await newUser.save();
    console.log('✅ Usuario guardado exitosamente:', newUser._id);

    // Respuesta exitosa (password se excluye automáticamente por toJSON)
    return NextResponse.json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('💥 Error crítico en registro:', {
      error: error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'Sin stack trace',
      timestamp: new Date().toISOString()
    });
    
    // Error de validación Zod (ya manejado arriba, pero por si acaso)
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
    if (error instanceof Error && 'code' in error) {
      if ((error as any).code === 11000) {
        console.error('❌ Error de duplicado en MongoDB:', error);
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Email o documento ya registrado' 
          },
          { status: 400 }
        );
      }
    }

    // Error de conexión a MongoDB
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('❌ Error de conexión a MongoDB:', error);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Error de conexión a la base de datos' 
        },
        { status: 503 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Error desconocido' : undefined
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
