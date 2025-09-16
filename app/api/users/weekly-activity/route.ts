import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener actividad semanal del usuario
    const actividadSemanal = await GamificationService.obtenerActividadSemanal(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: actividadSemanal
    });

  } catch (error) {
    console.error('Error en GET /api/users/weekly-activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}