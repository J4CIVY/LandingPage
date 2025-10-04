import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { EstadisticasUsuario } from '@/lib/models/Gamification';
import { LeaderboardResponse, LeaderboardMember, MembershipType } from '@/types/membership';

// GET - Obtener leaderboard de miembros por puntos REALES del sistema de gamificación
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Máximo 100
    
    // Obtener estadísticas de usuarios con puntos, ordenadas por puntos totales
    const userStats = await EstadisticasUsuario.find({
      puntosActuales: { $gt: 0 } // Solo usuarios con puntos
    })
    .sort({ puntosActuales: -1 }) // Ordenar por puntos descendente
    .limit(limit)
    .select('usuarioId puntosActuales puntosHistoricos eventosAsistidos eventosCancelados logrosDesbloqueados')
    .lean();

    // Obtener información de usuarios
    const userIds = userStats.map(stat => stat.usuarioId);
    const users = await User.find({ 
      _id: { $in: userIds },
      isActive: true
    })
    .select('firstName lastName membershipType')
    .lean();

    // Crear mapa de usuarios para búsqueda rápida
    const userMap = new Map(
      users.map(user => [(user._id as any).toString(), user])
    );

    // Crear leaderboard con datos reales
    const membersWithPoints: LeaderboardMember[] = userStats
      .map((stat: any, index) => {
        const userId = (stat.usuarioId as any).toString();
        const user = userMap.get(userId);
        
        if (!user) return null; // Skip si el usuario no existe o no está activo
        
        return {
          userId: userId,
          name: `${user.firstName} ${user.lastName}`,
          points: stat.puntosActuales || 0,
          membershipType: mapLegacyMembershipType(user.membershipType) as MembershipType,
          position: index + 1,
          avatar: undefined // TODO: Agregar URL de avatar si está disponible
        };
      })
      .filter(member => member !== null) as LeaderboardMember[];

    const response: LeaderboardResponse = {
      members: membersWithPoints,
      userPosition: undefined // Se podría calcular si se tiene el userId del request
    };

    return NextResponse.json({
      success: true,
      data: response,
      metadata: {
        totalUsers: membersWithPoints.length,
        generatedAt: new Date().toISOString(),
        note: 'Puntos obtenidos del sistema de gamificación en tiempo real'
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function mapLegacyMembershipType(legacyType: string): MembershipType {
  const mapping: Record<string, MembershipType> = {
    'friend': 'Friend',
    'rider': 'Rider',
    'rider-duo': 'Rider',
    'pro': 'Pro',
    'pro-duo': 'Pro',
  };
  
  return mapping[legacyType] || 'Friend';
}