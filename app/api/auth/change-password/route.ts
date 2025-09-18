import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST API CHANGE PASSWORD ===');
    
    // Test 1: Conexión a BD
    await connectDB();
    console.log('✓ Conexión a BD establecida');
    
    // Test 2: Autenticación
    const authResult = await verifyAuth(request);
    console.log('✓ Resultado auth:', { 
      success: authResult.success, 
      hasUser: !!authResult.user 
    });
    
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
    
    // Test 3: Parsear body
    const body = await request.json();
    console.log('✓ Body recibido:', { 
      hasCurrentPassword: !!body.currentPassword,
      hasNewPassword: !!body.newPassword
    });
    
    const { currentPassword, newPassword } = body;
    
    // Test 4: Validaciones básicas
    if (!currentPassword || !newPassword) {
      console.log('❌ Campos faltantes');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }
    
    // Test 5: Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(newPassword);
    console.log('✓ Validación de contraseña:', { 
      isValid: passwordValidation.isValid, 
      errorsCount: passwordValidation.errors.length 
    });
    
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
    
    // Test 6: Buscar usuario
    const user = await User.findById(authResult.user.id);
    console.log('✓ Usuario encontrado:', { 
      id: authResult.user.id, 
      found: !!user 
    });
    
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
    
    // Test 7: Verificar contraseña actual
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

    // Test 8: Verificar que la nueva contraseña sea diferente
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

    // Test 9: Actualizar contraseña
    console.log('→ Actualizando contraseña...');
    user.password = newPassword;
    user.lastActivity = new Date();
    
    await user.save();
    console.log('✓ Contraseña actualizada en BD');
    
    // Test 10: Enviar email de notificación (de forma segura)
    const timestamp = new Date().toISOString();
    
    // Intentar enviar email pero no bloquear si falla
    try {
      const { EmailService } = await import('@/lib/email-service');
      const emailService = new EmailService();
      
      const userAgent = request.headers.get('user-agent') || undefined;
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ipAddress = forwarded?.split(',')[0] || realIp || request.headers.get('remote-addr') || undefined;
      
      // Enviar de forma asíncrona
      emailService.sendPasswordChangeNotification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          timestamp,
          ipAddress,
          userAgent
        }
      ).then(() => {
        console.log(`✅ Notificación enviada a: ${user.email}`);
      }).catch((emailError) => {
        console.error('❌ Error enviando email:', emailError.message);
      });
      
      console.log('→ Email programado para envío asíncrono');
    } catch (emailError) {
      console.error('❌ Error inicializando servicio de email:', emailError);
      // Continuamos sin el email
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contraseña actualizada correctamente',
        timestamp
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 ERROR EN API TEST:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en test básico',
        details: error instanceof Error ? error.message : String(error)
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