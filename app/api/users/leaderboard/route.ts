import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';

// GET /api/users/leaderboard - Obtener tabla de clasificación
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario (opcional para leaderboard público)
    const authResult = await verifyAuth(request);
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const includeUser = url.searchParams.get('includeUser') === 'true';
    
    // Obtener leaderboard
    const leaderboard = await GamificationService.obtenerLeaderboard(limit);
    
    let userPosition = null;
    
    // Si hay usuario autenticado y se solicita incluir su posición
    if (authResult.success && authResult.user && includeUser) {
      const ranking = await GamificationService.obtenerRankingUsuario(authResult.user.id) as { posicion?: number };
      const userStats = await GamificationService.obtenerEstadisticasUsuario(authResult.user.id) as {
        estadisticas?: { puntos?: { total?: number }; ranking?: { cambioSemanal?: number } };
        nivelInfo?: { actual?: string };
        usuario?: unknown;
      };
      
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