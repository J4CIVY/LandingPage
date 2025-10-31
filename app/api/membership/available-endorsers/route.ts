import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth-utils';

// GET - Obtener endorsers disponibles (Leaders y Masters activos)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Buscar Leaders y Masters activos (excluyendo al usuario actual)
    const availableEndorsers = await db.collection('users').find({
      _id: { $ne: payload.userId },
      membershipType: { $in: ['Leader', 'Master'] },
      membershipStatus: 'active',
      isActive: true
    }).project({
      _id: 1,
      name: 1,
      email: 1,
      membershipType: 1,
      joinDate: 1
    }).toArray();

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: availableEndorsers.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        membershipType: user.membershipType,
        joinDate: user.joinDate
      }))
    });

  } catch (error) {
    console.error('Error fetching available endorsers:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}