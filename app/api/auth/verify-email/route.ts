import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido')
});

// Función auxiliar para verificar email y enviar bienvenida
async function processEmailVerification(user: any) {
  // Verificar email y activar cuenta
  user.isEmailVerified = true;
  user.isActive = true;
  user.emailVerificationToken = undefined;
  await user.save();

  // Enviar email de bienvenida
  try {
    const { EmailService } = await import('@/lib/email-service');
    const emailService = new EmailService();
    await emailService.sendWelcomeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      {
        membershipType: user.membershipType,
        firstName: user.firstName,
        lastName: user.lastName
      }
    );
  } catch (emailError) {
    console.error('Error enviando email de bienvenida:', emailError);
    // No fallar la verificación si el email de bienvenida falla
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Buscar usuario con el token de verificación
    const user = await User.findOne({ 
      emailVerificationToken: token,
      isEmailVerified: false
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de verificación inválido o ya utilizado',
          error: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    await processEmailVerification(user);

    return NextResponse.json(
      {
        success: true,
        message: 'Correo electrónico verificado exitosamente. Tu cuenta ha sido activada y recibirás un email de bienvenida.',
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verificando email:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token requerido',
          error: 'MISSING_TOKEN'
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar usuario con el token de verificación
    const user = await User.findOne({ 
      emailVerificationToken: token,
      isEmailVerified: false
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de verificación inválido o ya utilizado',
          error: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    await processEmailVerification(user);

    return NextResponse.json(
      {
        success: true,
        message: 'Correo electrónico verificado exitosamente. Tu cuenta ha sido activada y recibirás un email de bienvenida.',
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verificando email:', error);
    
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
