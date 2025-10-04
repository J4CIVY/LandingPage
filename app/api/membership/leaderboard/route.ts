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
      'puntos.total': { $gt: 0 } // Solo usuarios con puntos
    })
    .sort({ 'puntos.total': -1 }) // Ordenar por puntos descendente
    .limit(limit)
    .select('usuarioId puntos eventos actividad ranking nivel logros')
    .populate('usuarioId', 'firstName lastName membershipType isActive')
    .lean();

    // Crear leaderboard con datos reales (ya populado)
    const membersWithPoints: LeaderboardMember[] = userStats
      .map((stat: any, index) => {
        const user = stat.usuarioId; // Datos populados del usuario
        
        if (!user || !user.isActive) return null; // Skip si el usuario no existe o no está activo
        
        return {
          userId: (user._id as any).toString(),
          name: `${user.firstName} ${user.lastName}`,
          points: stat.puntos?.total || 0, // Usar puntos.total del schema
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