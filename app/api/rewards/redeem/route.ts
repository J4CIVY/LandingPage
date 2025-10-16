import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';
import connectToDatabase from '@/lib/mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectToDatabase();
    
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recompensaId, userId } = body;

    if (!recompensaId) {
      return NextResponse.json(
        { success: false, error: 'ID de recompensa requerido' },
        { status: 400 }
      );
    }

    // Procesar el canje
    const resultado = await GamificationService.canjearRecompensa(
      userId || authResult.user.id,
      recompensaId
    );

    if (resultado.success) {
      return NextResponse.json({
        success: true,
        data: resultado.canje,
        message: 'Recompensa canjeada exitosamente'
      });
    } else {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error en POST /api/rewards/redeem:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}