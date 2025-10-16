import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET /api/users/points - Obtener información detallada de puntos
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Obtener estadísticas completas
    const estadisticas = await GamificationService.obtenerEstadisticasUsuario(userId);
    
    // Obtener historial de transacciones
    const historial = await GamificationService.obtenerHistorialTransacciones(userId, limit, page);
    
    // Obtener leaderboard (top 10)
    const leaderboard = await GamificationService.obtenerLeaderboard(10);
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPoints: estadisticas.estadisticas?.puntos?.total || 0,
          pointsToday: estadisticas.estadisticas?.puntos?.hoy || 0,
          pointsThisMonth: estadisticas.estadisticas?.puntos?.esteMes || 0,
          pointsThisYear: estadisticas.estadisticas?.puntos?.esteAno || 0,
          pointsEarned: estadisticas.estadisticas?.puntos?.ganados || 0,
          pointsSpent: estadisticas.estadisticas?.puntos?.canjeados || 0,
          pointsPending: estadisticas.estadisticas?.puntos?.pendientes || 0
        },
        level: estadisticas.nivelInfo,
        ranking: estadisticas.ranking,
        history: historial,
        leaderboard: leaderboard,
        nextRewards: estadisticas.proximasRecompensas,
        user: estadisticas.usuario
      }
    });

  } catch (error) {
    console.error('Error fetching points data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users/points - Otorgar puntos manualmente (admin only)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const { targetUserId, points, reason, action = 'bonificacion' } = await request.json();
    
    // Validar datos de entrada
    if (!targetUserId || typeof points !== 'number' || !reason) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Otorgar puntos
    const transaccion = await GamificationService.otorgarPuntos(
      targetUserId, 
      action, 
      { 
        adminId: authResult.user.id,
        reason: reason,
        manualPoints: points
      }
    );
    
    // Obtener estadísticas actualizadas del usuario objetivo
    const estadisticasActualizadas = await GamificationService.obtenerEstadisticasUsuario(targetUserId);
    
    return NextResponse.json({
      success: true,
      message: `Puntos otorgados exitosamente`,
      data: {
        pointsAwarded: transaccion.cantidad,
        totalPoints: estadisticasActualizadas.estadisticas?.puntos?.total || 0,
        newLevel: estadisticasActualizadas.nivelInfo?.actual,
        transaction: {
          id: transaccion._id,
          reason: transaccion.razon,
          date: transaccion.fechaTransaccion
        }
      }
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}