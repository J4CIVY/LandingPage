import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { extractTokenFromRequest, verifyAccessToken, verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';
import { EmailService } from '@/lib/email-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación usando verifyAuth
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de acceso requerido o inválido' 
        },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validar que se proporcionaron los campos requeridos
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }

    // Validar la fortaleza de la nueva contraseña
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña no cumple con los requisitos de seguridad',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(authResult.user.id);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }

    // Verificar que la contraseña actual sea correcta
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña debe ser diferente a la actual' 
        },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    user.password = newPassword;
    user.lastActivity = new Date();
    
    // El middleware pre('save') del modelo User se encargará de hashear la contraseña
    await user.save();

    // Enviar notificación por email (de forma asíncrona para no bloquear la respuesta)
    const timestamp = new Date().toISOString();
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || request.headers.get('remote-addr') || undefined;

    // Enviar email de notificación de forma asíncrona
    setImmediate(async () => {
      try {
        const emailService = new EmailService();
        await emailService.sendPasswordChangeNotification(
          user.email,
          `${user.firstName} ${user.lastName}`,
          {
            timestamp,
            ipAddress,
            userAgent
          }
        );
        console.log(`Notificación de cambio de contraseña enviada a: ${user.email}`);
      } catch (emailError) {
        console.error('Error enviando notificación de cambio de contraseña:', emailError);
        // No propagamos el error para no afectar la respuesta principal
      }
    });

    // Respuesta exitosa (sin incluir datos sensibles)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contraseña actualizada correctamente',
        timestamp
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en cambio de contraseña:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}