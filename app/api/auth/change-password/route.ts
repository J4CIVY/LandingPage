import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CAMBIO DE CONTRASEÑA ===');
    
    await connectDB();
    console.log('✓ Conexión a BD establecida');

    // Verificar autenticación
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
    console.log('✓ Usuario autenticado:', authResult.user.id);
    
    // Obtener datos del cuerpo
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validaciones básicas
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }

    // Validar fortaleza de contraseña
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
    
    // Buscar usuario
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
    console.log('✓ Usuario encontrado en BD');

    // Verificar contraseña actual usando bcrypt directamente
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Contraseña actual verificada');

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña debe ser diferente a la actual' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Nueva contraseña es diferente');

    // Actualizar contraseña
    user.password = newPassword;
    user.lastActivity = new Date();
    await user.save();
    console.log('✓ Contraseña actualizada en BD');
    
    // Enviar email de notificación de forma segura
    const timestamp = new Date().toISOString();
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
    }
    
    console.log('✅ CAMBIO DE CONTRASEÑA EXITOSO');
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