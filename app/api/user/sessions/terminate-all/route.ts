import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import Session from '@/lib/models/Session';

// POST - Cerrar todas las sesiones excepto la actual
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Desactivar todas las sesiones excepto la actual
    const result = await Session.updateMany(
      {
        userId: authResult.session.userId,
        _id: { $ne: authResult.session.sessionId },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    return NextResponse.json({ 
      success: true,
      message: `Se cerraron ${result.modifiedCount} sesión(es)`,
      terminatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error cerrando todas las sesiones:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesiones' },
      { status: 500 }
    );
  }
}
