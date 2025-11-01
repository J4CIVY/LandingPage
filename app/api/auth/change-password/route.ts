import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection - Critical endpoint
    const csrfError = requireCSRFToken(request);
    if (csrfError) {
      console.error('[SECURITY] CSRF validation failed on change-password endpoint');
      return csrfError;
    }
    
    // Paso 1: Conectar a BD
    await connectDB();

    // Paso 2: Verificar autenticación
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
    
    // Paso 3: Parsear body
    const body = await request.json();
    
    const { currentPassword, newPassword } = body;

    // Paso 4: Validaciones básicas
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }

    // Paso 5: Validar fortaleza de contraseña
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
    
    // Paso 6: Buscar usuario
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

    // Paso 7: Verificar contraseña actual usando bcrypt directamente
    
    let isCurrentPasswordValid = false;
    try {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } catch (bcryptError) {
      console.error('❌ Paso 7: Error en bcrypt.compare:', bcryptError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error en bcrypt.compare: ${bcryptError instanceof Error ? bcryptError.message : String(bcryptError)}` 
        },
        { status: 500 }
      );
    }
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }

    // Paso 8: Verificar que la nueva contraseña sea diferente
    let isSamePassword = false;
    try {
      isSamePassword = await bcrypt.compare(newPassword, user.password);
    } catch (bcryptError) {
      console.error('❌ Paso 8: Error en segunda bcrypt.compare:', bcryptError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error en segunda bcrypt.compare: ${bcryptError instanceof Error ? bcryptError.message : String(bcryptError)}` 
        },
        { status: 500 }
      );
    }
    
    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña debe ser diferente a la actual' 
        },
        { status: 400 }
      );
    }

    // Paso 9: Actualizar contraseña usando el modelo
    
    try {
      user.password = newPassword;
      user.lastActivity = new Date();
      
      await user.save();
    } catch (saveError) {
      console.error('❌ Paso 9: Error en save():', saveError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error guardando usuario: ${saveError instanceof Error ? saveError.message : String(saveError)}` 
        },
        { status: 500 }
      );
    }
    
    // Paso 10: Enviar email de notificación de forma segura
    const timestamp = new Date().toISOString();
    
    try {
      const { EmailService } = await import('@/lib/email-service');
      const emailService = new EmailService();
      
      const userAgent = request.headers.get('user-agent') || undefined;
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ipAddress = forwarded?.split(',')[0] || realIp || request.headers.get('remote-addr') || undefined;
      
      
      const emailData = {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        context: {
          timestamp,
          ipAddress,
          userAgent
        }
      };
      
      // Enviar de forma asíncrona
      emailService.sendPasswordChangeNotification(
        emailData.email,
        emailData.name,
        emailData.context
      ).then(() => {
      }).catch((emailError) => {
        console.error('❌ Paso 10: Error enviando email:', emailError.message);
      });
      
    } catch (emailError) {
      console.error('❌ Paso 10: Error inicializando servicio de email:', emailError);
    }
    
    // Paso 11: Respuesta exitosa
    const responseData = { 
      success: true, 
      message: 'Contraseña actualizada correctamente',
      timestamp
    };
    
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN CAMBIO DE CONTRASEÑA:');
    console.error('   - Tipo de error:', typeof error);
    console.error('   - Es instancia de Error:', error instanceof Error);
    console.error('   - Error completo:', error);
    
    if (error instanceof Error) {
      console.error('   - Mensaje:', error.message);
      console.error('   - Stack trace:', error.stack);
      console.error('   - Name:', error.name);
    }
    
    const errorDetails = {
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.error('   - Respuesta de error:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
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