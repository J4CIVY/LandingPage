import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import GamificationService from '@/lib/services/GamificationService';

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

    // Contar eventos (método tradicional)
    const registeredEventsCount = (user as any).events?.length || 0;
    const favoriteEventsCount = (user as any).favoriteEvents?.length || 0;
    const attendedEventsCount = (user as any).attendedEvents?.length || 0;

    // Calcular días como miembro
    const now = new Date();
    const joinDate = (user as any).joinDate || (user as any).createdAt;
    const daysSinceJoining = Math.floor(
      (now.getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Obtener estadísticas de gamificación
    let gamificationStats = null;
    try {
      gamificationStats = await GamificationService.getUserStatsDetails(decoded.userId);
    } catch (error) {
      console.log('No se pudieron obtener estadísticas de gamificación:', error);
    }

    // Estadísticas tradicionales
    const traditionalStats = {
      eventsRegistered: registeredEventsCount,
      eventsAttended: attendedEventsCount,
      favoriteEvents: favoriteEventsCount,
      daysSinceJoining: daysSinceJoining,
      memberSince: joinDate ? new Date(joinDate).toISOString() : new Date((user as any).createdAt).toISOString(),
      membershipType: (user as any).membershipType,
      isActive: (user as any).isActive
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: traditionalStats,
        gamification: gamificationStats // Incluir datos de gamificación si están disponibles
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
