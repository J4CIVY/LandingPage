import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO CAMBIO DE CONTRASEÑA ===');
    
    await connectDB();
    console.log('✓ Conexión a BD establecida');

    // Verificar autenticación usando verifyAuth
    const authResult = await verifyAuth(request);
    console.log('✓ Resultado auth:', { success: authResult.success, hasUser: !!authResult.user });
    
    if (!authResult.success || !authResult.user) {
      console.log('❌ Autenticación fallida');
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
    console.log('✓ Body recibido, tiene campos:', { 
      hasCurrentPassword: !!body.currentPassword, 
      hasNewPassword: !!body.newPassword 
    });
    
    const { currentPassword, newPassword } = body;

    // Validar que se proporcionaron los campos requeridos
    if (!currentPassword || !newPassword) {
      console.log('❌ Campos faltantes:', { currentPassword: !!currentPassword, newPassword: !!newPassword });
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Campos validados');

    // Validar la fortaleza de la nueva contraseña
    const passwordValidation = validatePasswordStrength(newPassword);
    console.log('✓ Validación de contraseña:', { isValid: passwordValidation.isValid, errorsCount: passwordValidation.errors.length });
    
    if (!passwordValidation.isValid) {
      console.log('❌ Contraseña no válida:', passwordValidation.errors);
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
    console.log('✓ Usuario encontrado:', { id: authResult.user.id, found: !!user });
    
    if (!user) {
      console.log('❌ Usuario no encontrado en BD');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }

    // Verificar que la contraseña actual sea correcta
    console.log('→ Verificando contraseña actual...');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    console.log('✓ Contraseña actual válida:', isCurrentPasswordValid);
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Contraseña actual incorrecta');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    console.log('→ Verificando que la nueva contraseña sea diferente...');
    const isSamePassword = await user.comparePassword(newPassword);
    console.log('✓ Nueva contraseña es diferente:', !isSamePassword);
    
    if (isSamePassword) {
      console.log('❌ Nueva contraseña igual a la actual');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña debe ser diferente a la actual' 
        },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    console.log('→ Actualizando contraseña...');
    user.password = newPassword;
    user.lastActivity = new Date();
    
    // El middleware pre('save') del modelo User se encargará de hashear la contraseña
    await user.save();
    console.log('✓ Contraseña actualizada en BD');

    // Obtener información para el email
    const timestamp = new Date().toISOString();
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || request.headers.get('remote-addr') || undefined;

    // Intentar enviar email de notificación (sin bloquear la respuesta)
    try {
      const emailService = new EmailService();
      // Enviar de forma asíncrona sin bloquear
      emailService.sendPasswordChangeNotification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          timestamp,
          ipAddress,
          userAgent
        }
      ).then(() => {
        console.log(`Notificación de cambio de contraseña enviada a: ${user.email}`);
      }).catch((emailError) => {
        console.error('Error enviando notificación de cambio de contraseña:', emailError);
      });
    } catch (emailError) {
      console.error('Error inicializando servicio de email:', emailError);
      // Continuamos sin el email, no es crítico
    }

    // Respuesta exitosa (sin incluir datos sensibles)
    console.log('✅ CAMBIO DE CONTRASEÑA EXITOSO');
    console.log('=== FIN CAMBIO DE CONTRASEÑA ===');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contraseña actualizada correctamente',
        timestamp
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 ERROR EN CAMBIO DE CONTRASEÑA:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
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