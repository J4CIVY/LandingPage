import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';

// GET /api/users/leaderboard - Obtener tabla de clasificación
// PROTEGIDO: Requiere autenticación
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 🔒 SEGURIDAD: Requerir autenticación para ver leaderboard
    const authResult = await requireAuth(request);
    
    if (!authResult.success || !authResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Se requiere autenticación para ver el ranking' 
        },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const includeUser = url.searchParams.get('includeUser') === 'true';
    
    // Obtener leaderboard
    const leaderboard = await GamificationService.obtenerLeaderboard(limit);
    
    let userPosition = null;
    
    // Si el usuario autenticado solicita incluir su posición
    if (authResult.user && includeUser) {
      const ranking = await GamificationService.obtenerRankingUsuario(authResult.user.id);
      const userStats = await GamificationService.obtenerEstadisticasUsuario(authResult.user.id);
      
      userPosition = {
        position: ranking.posicion,
        user: userStats.usuario,
        points: userStats.estadisticas?.puntos?.total || 0,
        level: userStats.nivelInfo?.actual || 'Novato',
        change: userStats.estadisticas?.ranking?.cambioSemanal || 0
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        userPosition,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}