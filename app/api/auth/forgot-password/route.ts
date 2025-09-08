import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { forgotPasswordSchema } from '@/schemas/authSchemas';
import { generateSecureToken } from '@/lib/auth-utils';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting para forgot password (más restrictivo)
const forgotPasswordRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 50 // 50 IPs diferentes por intervalo
});

export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await forgotPasswordRateLimit.check(clientIP, 3); // 3 intentos por IP cada 15 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos de restablecimiento. Intenta nuevamente en 15 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Validar datos de entrada
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Formato de email inválido',
          error: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Buscar usuario por email
    const user = await User.findOne({ 
      email,
      isActive: true 
    });

    // Por seguridad, siempre devolvemos éxito (no revelamos si el usuario existe)
    // Esto previene enumeración de usuarios
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña'
        },
        { status: 200 }
      );
    }

    // Generar token de restablecimiento
    const resetToken = generateSecureToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Enviar email de restablecimiento
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'password_reset',
          recipientEmail: email,
          recipientName: `${user.firstName} ${user.lastName}`,
          templateData: {
            resetToken
          }
        }),
      });

      const emailResult = await emailResponse.json();
      
      if (!emailResult.success) {
        console.error('Error enviando email de restablecimiento:', emailResult.message);
        // No revelamos el error del email al usuario por seguridad
      }
    } catch (emailError) {
      console.error('Error enviando email de restablecimiento:', emailError);
      // Continuamos sin revelar el error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en forgot password:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
