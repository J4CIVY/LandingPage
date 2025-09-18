import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth, validatePasswordStrength } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CAMBIO DE CONTRASEÑA INICIADO ===');
    
    // Paso 1: Conectar a BD
    console.log('→ Paso 1: Conectando a base de datos...');
    await connectDB();
    console.log('✓ Paso 1: Conexión a BD establecida');

    // Paso 2: Verificar autenticación
    console.log('→ Paso 2: Verificando autenticación...');
    const authResult = await verifyAuth(request);
    console.log('✓ Paso 2: Resultado auth:', { success: authResult.success, hasUser: !!authResult.user });
    
    if (!authResult.success || !authResult.user) {
      console.log('❌ Paso 2: Autenticación fallida');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de acceso requerido o inválido' 
        },
        { status: 401 }
      );
    }
    console.log('✓ Paso 2: Usuario autenticado:', authResult.user.id);
    
    // Paso 3: Parsear body
    console.log('→ Paso 3: Parseando body de la petición...');
    const body = await request.json();
    console.log('✓ Paso 3: Body parseado correctamente');
    
    const { currentPassword, newPassword } = body;
    console.log('✓ Paso 3: Campos extraídos:', { 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword,
      currentPasswordLength: currentPassword?.length,
      newPasswordLength: newPassword?.length
    });

    // Paso 4: Validaciones básicas
    console.log('→ Paso 4: Validando campos requeridos...');
    if (!currentPassword || !newPassword) {
      console.log('❌ Paso 4: Campos faltantes');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual y la nueva contraseña son requeridas' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Paso 4: Campos requeridos presentes');

    // Paso 5: Validar fortaleza de contraseña
    console.log('→ Paso 5: Validando fortaleza de contraseña...');
    const passwordValidation = validatePasswordStrength(newPassword);
    console.log('✓ Paso 5: Validación completada:', { 
      isValid: passwordValidation.isValid, 
      errorsCount: passwordValidation.errors?.length || 0 
    });
    
    if (!passwordValidation.isValid) {
      console.log('❌ Paso 5: Contraseña no válida:', passwordValidation.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña no cumple con los requisitos de seguridad',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }
    console.log('✓ Paso 5: Contraseña válida');
    
    // Paso 6: Buscar usuario
    console.log('→ Paso 6: Buscando usuario en BD...');
    const user = await User.findById(authResult.user.id);
    console.log('✓ Paso 6: Usuario buscado:', { 
      id: authResult.user.id, 
      found: !!user,
      hasPassword: user ? !!user.password : false
    });
    
    if (!user) {
      console.log('❌ Paso 6: Usuario no encontrado');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }
    console.log('✓ Paso 6: Usuario encontrado en BD');

    // Paso 7: Verificar contraseña actual usando bcrypt directamente
    console.log('→ Paso 7: Verificando contraseña actual...');
    console.log('   - Hash almacenado presente:', !!user.password);
    console.log('   - Longitud del hash:', user.password?.length || 0);
    console.log('   - Prefijo del hash:', user.password?.substring(0, 10) || 'N/A');
    
    let isCurrentPasswordValid = false;
    try {
      console.log('   - Ejecutando bcrypt.compare...');
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      console.log('✓ Paso 7: Resultado de comparación:', isCurrentPasswordValid);
    } catch (bcryptError) {
      console.error('❌ Paso 7: Error en bcrypt.compare:', bcryptError);
      throw new Error(`Error en bcrypt.compare: ${bcryptError.message}`);
    }
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Paso 7: Contraseña actual incorrecta');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña actual es incorrecta' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Paso 7: Contraseña actual verificada');

    // Paso 8: Verificar que la nueva contraseña sea diferente
    console.log('→ Paso 8: Verificando que nueva contraseña sea diferente...');
    let isSamePassword = false;
    try {
      console.log('   - Ejecutando segunda bcrypt.compare...');
      isSamePassword = await bcrypt.compare(newPassword, user.password);
      console.log('✓ Paso 8: Resultado comparación (¿son iguales?):', isSamePassword);
    } catch (bcryptError) {
      console.error('❌ Paso 8: Error en segunda bcrypt.compare:', bcryptError);
      throw new Error(`Error en segunda bcrypt.compare: ${bcryptError.message}`);
    }
    
    if (isSamePassword) {
      console.log('❌ Paso 8: Nueva contraseña igual a la actual');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La nueva contraseña debe ser diferente a la actual' 
        },
        { status: 400 }
      );
    }
    console.log('✓ Paso 8: Nueva contraseña es diferente');

    // Paso 9: Actualizar contraseña usando el modelo
    console.log('→ Paso 9: Actualizando contraseña usando modelo User...');
    console.log('   - ID del usuario:', user._id);
    console.log('   - Activando middleware de hashing...');
    
    try {
      console.log('   - Asignando nueva contraseña...');
      user.password = newPassword;
      user.lastActivity = new Date();
      
      console.log('   - Ejecutando save()...');
      await user.save();
      console.log('✓ Paso 9: Contraseña actualizada en BD exitosamente');
    } catch (saveError) {
      console.error('❌ Paso 9: Error en save():', saveError);
      throw new Error(`Error guardando usuario: ${saveError.message}`);
    }
    
    // Paso 10: Enviar email de notificación de forma segura
    console.log('→ Paso 10: Enviando notificación por email...');
    const timestamp = new Date().toISOString();
    console.log('   - Timestamp:', timestamp);
    
    try {
      console.log('   - Importando EmailService...');
      const { EmailService } = await import('@/lib/email-service');
      const emailService = new EmailService();
      
      console.log('   - Obteniendo datos de la request...');
      const userAgent = request.headers.get('user-agent') || undefined;
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ipAddress = forwarded?.split(',')[0] || realIp || request.headers.get('remote-addr') || undefined;
      
      console.log('   - User-Agent:', userAgent);
      console.log('   - IP Address:', ipAddress);
      
      console.log('   - Preparando datos para email...');
      const emailData = {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        context: {
          timestamp,
          ipAddress,
          userAgent
        }
      };
      console.log('   - Email a enviar a:', emailData.email);
      console.log('   - Nombre del usuario:', emailData.name);
      
      // Enviar de forma asíncrona
      console.log('   - Ejecutando sendPasswordChangeNotification...');
      emailService.sendPasswordChangeNotification(
        emailData.email,
        emailData.name,
        emailData.context
      ).then(() => {
        console.log(`✅ Paso 10: Notificación enviada exitosamente a: ${emailData.email}`);
      }).catch((emailError) => {
        console.error('❌ Paso 10: Error enviando email:', emailError.message);
      });
      
      console.log('✓ Paso 10: Email programado para envío asíncrono');
    } catch (emailError) {
      console.error('❌ Paso 10: Error inicializando servicio de email:', emailError);
    }
    
    // Paso 11: Respuesta exitosa
    console.log('→ Paso 11: Preparando respuesta exitosa...');
    const responseData = { 
      success: true, 
      message: 'Contraseña actualizada correctamente',
      timestamp
    };
    console.log('   - Response data:', responseData);
    console.log('✅ CAMBIO DE CONTRASEÑA COMPLETADO EXITOSAMENTE');
    
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