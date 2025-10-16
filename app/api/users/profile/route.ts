import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { detectBehaviorAnomaly } from '@/lib/anomaly-detection';

// GET - Obtener perfil del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación usando la función centralizada
    const authResult = await verifyAuth(request);

    if (!authResult.success || !authResult.isValid) {
      return NextResponse.json(
        { success: false, message: authResult.error || 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Buscar usuario en la base de datos
    const user = await User.findById(authResult.user!.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Usar el método getPublicProfile que ahora incluye todos los campos
    return NextResponse.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Error en GET /api/users/profile:', error);

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación usando la función centralizada
    const authResult = await verifyAuth(request);

    if (!authResult.success || !authResult.isValid) {
      return NextResponse.json(
        { success: false, message: authResult.error || 'No autorizado' },
        { status: 401 }
      );
    }

    // 1. Rate Limiting para actualizaciones de perfil
    const rateLimitResult = await checkRateLimit(request, {
      maxRequests: 10,
      windowSeconds: 3600, // 10 actualizaciones por hora
      keyPrefix: 'ratelimit:profile-update',
    }, authResult.user!.id);
    
    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { success: false, message: `Demasiadas actualizaciones. Espera ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.` },
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    await connectDB();
    
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
    if (email !== authResult.user!.email) {
      // 2. Anomaly Detection - Cambio de email es una acción crítica
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      const anomalyResult = await detectBehaviorAnomaly({
        userId: authResult.user!.id,
        eventType: 'email_change',
        ip: clientIP,
        userAgent,
        timestamp: Date.now()
      });

      if (anomalyResult.shouldBlock) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Actividad sospechosa detectada. Por seguridad, esta acción ha sido bloqueada.',
            details: anomalyResult.reasons 
          },
          { status: 403 }
        );
      }

      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: authResult.user!.id } 
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Este email ya está registrado por otro usuario' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualización con sanitización
    const updateData: any = {
      firstName: firstName.toString().trim().substring(0, 100),
      lastName: lastName.toString().trim().substring(0, 100),
      email: email.toString().toLowerCase().trim().substring(0, 254),
      phone: phone?.toString().trim().substring(0, 20) || '',
      address: address?.toString().trim().substring(0, 200) || '',
      city: city?.toString().trim().substring(0, 100) || '',
      country: country?.toString().trim().substring(0, 100) || '',
      birthDate: dateOfBirth || null,
      motorcycleBrand: motorcycleInfo?.brand?.toString().trim().substring(0, 50) || '',
      motorcycleModel: motorcycleInfo?.model?.toString().trim().substring(0, 50) || '',
      motorcycleYear: motorcycleInfo?.year?.toString().trim().substring(0, 4) || '',
      motorcyclePlate: motorcycleInfo?.licensePlate?.toString().trim().substring(0, 20) || '',
      emergencyContactName: emergencyContact?.name?.toString().trim().substring(0, 100) || '',
      emergencyContactPhone: emergencyContact?.phone?.toString().trim().substring(0, 20) || '',
      emergencyContactRelationship: emergencyContact?.relationship?.toString().trim().substring(0, 50) || '',
      updatedAt: new Date()
    };

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user!.id,
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

    const response = NextResponse.json({
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

    // Add rate limit headers to response
    addRateLimitHeaders(response.headers, rateLimitResult);
    
    return response;

  } catch (error) {
    console.error('Error en PUT /api/users/profile:', error);

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
