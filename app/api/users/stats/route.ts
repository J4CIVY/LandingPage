import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { GamificationService } from '@/lib/services/GamificationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener estadísticas del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Buscar usuario
    const user = await User.findById(decoded.userId)
      .populate('events')
      .populate('favoriteEvents')
      .populate('attendedEvents')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estadísticas de gamificación
    const estadisticasGamificacion = await GamificationService.obtenerEstadisticasUsuario(decoded.userId);

    // Contar eventos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registeredEventsCount = (user as any).events?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const favoriteEventsCount = (user as any).favoriteEvents?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendedEventsCount = (user as any).attendedEvents?.length || 0;

    // Calcular días como miembro
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const joinDate = (user as any).joinDate || (user as any).createdAt;
    const daysSinceJoining = Math.floor(
      (now.getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Combinar estadísticas tradicionales con gamificación
    const statsData = {
      eventsRegistered: registeredEventsCount,
      eventsAttended: attendedEventsCount,
      favoriteEvents: favoriteEventsCount,
      daysSinceJoining: daysSinceJoining,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      memberSince: joinDate ? new Date(joinDate).toISOString() : new Date((user as any).createdAt).toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      membershipType: (user as any).membershipType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isActive: (user as any).isActive,
      
      // Datos de gamificación
      totalPoints: estadisticasGamificacion.estadisticas?.puntos?.total || 0,
      pointsToday: estadisticasGamificacion.estadisticas?.puntos?.hoy || 0,
      pointsThisMonth: estadisticasGamificacion.estadisticas?.puntos?.esteMes || 0,
      pointsThisYear: estadisticasGamificacion.estadisticas?.puntos?.esteAno || 0,
      currentLevel: estadisticasGamificacion.nivelInfo?.actual || 'Novato',
      levelIcon: estadisticasGamificacion.nivelInfo?.icono || '🌱',
      levelProgress: estadisticasGamificacion.nivelInfo?.progreso || 0,
      nextLevelPoints: estadisticasGamificacion.nivelInfo?.puntosSiguienteNivel || 100,
      ranking: {
        position: estadisticasGamificacion.ranking?.posicion || 0,
        totalUsers: estadisticasGamificacion.ranking?.totalUsuarios || 0,
        percentile: estadisticasGamificacion.ranking?.percentil || 0,
        change: estadisticasGamificacion.estadisticas?.ranking?.cambioSemanal || 0
      },
      activity: {
        activeDays: estadisticasGamificacion.estadisticas?.actividad?.diasActivo || daysSinceJoining,
        currentStreak: estadisticasGamificacion.estadisticas?.actividad?.rachaActual || 1,
        bestStreak: estadisticasGamificacion.estadisticas?.actividad?.mejorRacha || 1,
        lastConnection: estadisticasGamificacion.estadisticas?.actividad?.ultimaConexion || new Date(),
        totalInteractions: estadisticasGamificacion.estadisticas?.actividad?.interacciones || 0
      },
      achievements: {
        total: estadisticasGamificacion.estadisticas?.logros?.total || 0,
        recent: estadisticasGamificacion.estadisticas?.logros?.ultimoLogro || null
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: statsData
      }
    });

  } catch (error) {
    console.error('Error en GET /api/users/stats:', error);
    
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
