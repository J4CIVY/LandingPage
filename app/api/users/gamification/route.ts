import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';

// GET /api/users/gamification - Obtener datos de gamificación del usuario
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
    
    // Obtener estadísticas completas usando el servicio
    const estadisticasCompletas = await GamificationService.obtenerEstadisticasUsuario(userId);
    
    // Formatear datos para compatibilidad con el frontend existente
    const datosCompatibles = {
      stats: {
        participationScore: estadisticasCompletas.estadisticas?.actividad?.interacciones || 0,
        maxParticipationScore: 1000, // Valor máximo de referencia
        totalPoints: estadisticasCompletas.estadisticas?.puntos?.total || 0,
        userRank: estadisticasCompletas.ranking?.posicion || 0,
        totalUsers: estadisticasCompletas.ranking?.totalUsuarios || 0,
        level: estadisticasCompletas.nivelInfo?.actual || 'Novato',
        nextLevelPoints: estadisticasCompletas.nivelInfo?.puntosSiguienteNivel || 100,
        eventsAttended: estadisticasCompletas.estadisticas?.eventos?.asistidos || 0,
        eventsRegistered: estadisticasCompletas.estadisticas?.eventos?.registrados || 0,
        pointsToday: estadisticasCompletas.estadisticas?.puntos?.hoy || 0,
        pointsThisMonth: estadisticasCompletas.estadisticas?.puntos?.esteMes || 0,
        pointsThisYear: estadisticasCompletas.estadisticas?.puntos?.esteAno || 0,
        levelProgress: estadisticasCompletas.nivelInfo?.progreso || 0,
        currentStreak: estadisticasCompletas.estadisticas?.actividad?.rachaActual || 0,
        bestStreak: estadisticasCompletas.estadisticas?.actividad?.mejorRacha || 0,
        activeDays: estadisticasCompletas.estadisticas?.actividad?.diasActivo || 0,
        rankingChange: estadisticasCompletas.estadisticas?.ranking?.cambioSemanal || 0,
        achievements: estadisticasCompletas.estadisticas?.logros?.total || 0,
        recentActivity: {
          lastLogin: estadisticasCompletas.estadisticas?.actividad?.ultimaConexion,
          interactions: estadisticasCompletas.estadisticas?.actividad?.interacciones || 0
        }
      },
      level: {
        current: estadisticasCompletas.nivelInfo?.actual || 'Novato',
        icon: estadisticasCompletas.nivelInfo?.icono || '🌱',
        color: estadisticasCompletas.nivelInfo?.color || '#10B981',
        points: estadisticasCompletas.nivelInfo?.puntosActuales || 0,
        nextLevelPoints: estadisticasCompletas.nivelInfo?.puntosSiguienteNivel || 100,
        progress: estadisticasCompletas.nivelInfo?.progreso || 0
      },
      ranking: {
        position: estadisticasCompletas.ranking?.posicion || 0,
        totalUsers: estadisticasCompletas.ranking?.totalUsuarios || 0,
        percentile: estadisticasCompletas.ranking?.percentil || 0,
        change: estadisticasCompletas.estadisticas?.ranking?.cambioSemanal || 0
      },
      nextRewards: estadisticasCompletas.proximasRecompensas || [],
      user: {
        id: userId,
        name: `${estadisticasCompletas.usuario?.firstName} ${estadisticasCompletas.usuario?.lastName}`,
        membershipType: estadisticasCompletas.usuario?.membershipType || 'friend',
        joinDate: estadisticasCompletas.usuario?.joinDate
      }
    };

    return NextResponse.json({
      success: true,
      data: datosCompatibles
    });

  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users/gamification - Otorgar puntos por acción específica
export async function POST(request: NextRequest) {
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

    const { action, metadata } = await request.json();
    
    // Validar datos de entrada
    if (!action) {
      return NextResponse.json(
        { error: 'Acción requerida' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    
    // Otorgar puntos usando el servicio
    const transaccion = await GamificationService.otorgarPuntos(userId, action, metadata);
    
    // Obtener estadísticas actualizadas
    const estadisticasActualizadas = await GamificationService.obtenerEstadisticasUsuario(userId);
    
    return NextResponse.json({
      success: true,
      message: `Puntos otorgados por acción: ${action}`,
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
    console.error('Error updating gamification:', error);
    
    if (error instanceof Error && error.message.includes('Tipo de acción no válido')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}