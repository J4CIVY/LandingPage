import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido')
});

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

    // Verificar email y activar cuenta
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Correo electrónico verificado exitosamente. Tu cuenta ha sido activada.',
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

    // Verificar email y activar cuenta
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Correo electrónico verificado exitosamente. Tu cuenta ha sido activada.',
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
