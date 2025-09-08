import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { resetPasswordSchema } from '@/schemas/authSchemas';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Validar datos de entrada
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Buscar usuario con el token de restablecimiento
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }, // Token no expirado
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido o expirado'
        },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar la contraseña y limpiar tokens de reset
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Resetear intentos de login por si estaba bloqueado
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    user.updatedAt = new Date();
    
    await user.save();

    console.log(`Contraseña restablecida para usuario: ${user.email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
