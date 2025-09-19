import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { LeaderboardResponse, LeaderboardMember, MembershipType } from '@/types/membership';

// GET - Obtener leaderboard de miembros por puntos
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Máximo 100
    
    // Buscar usuarios activos, ordenados por puntos estimados
    // En una implementación real, esto debería usar una colección de estadísticas optimizada
    const users = await User.find({ 
      isActive: true,
      membershipType: { $exists: true }
    })
    .select('firstName lastName membershipType joinDate registeredEvents pqrsd createdAt')
    .limit(limit)
    .lean();

    // Calcular puntos para cada usuario y crear leaderboard
    const membersWithPoints = await Promise.all(
      users.map(async (user: any, index) => {
        const userStats = calculateUserStatsSync(user);
        
        return {
          userId: (user._id as string).toString(),
          name: `${user.firstName} ${user.lastName}`,
          points: userStats.points,
          membershipType: mapLegacyMembershipType(user.membershipType) as MembershipType,
          position: index + 1, // Temporal, se reordenará
          avatar: undefined // TODO: Agregar URL de avatar si está disponible
        };
      })
    );

    // Ordenar por puntos de mayor a menor y asignar posiciones reales
    const sortedMembers = membersWithPoints
      .sort((a, b) => b.points - a.points)
      .map((member, index) => ({
        ...member,
        position: index + 1
      }));

    const response: LeaderboardResponse = {
      members: sortedMembers,
      userPosition: undefined // Se podría calcular si se tiene el userId del request
    };

    return NextResponse.json({
      success: true,
      data: response,
      metadata: {
        totalUsers: users.length,
        generatedAt: new Date().toISOString(),
        note: 'Puntos calculados basándose en actividad histórica estimada'
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

function calculateUserStatsSync(user: any) {
  const joinDate = user.joinDate || user.createdAt;
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular puntos basándose en actividad estimada
  let points = 0;
  
  // Puntos base por tiempo como miembro
  const monthsAsMember = Math.floor(daysSinceJoining / 30);
  points += monthsAsMember * 50; // 50 puntos por mes
  
  // Puntos por eventos
  const eventsAttended = user.registeredEvents?.length || Math.floor(daysSinceJoining / 60);
  points += eventsAttended * 100; // 100 puntos por evento
  
  // Puntos por voluntariados
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5);
  points += volunteeringDone * 200; // 200 puntos por voluntariado
  
  // Bonus por tipo de membresía (los miembros de mayor nivel probablemente tienen más actividad)
  const membershipMultiplier = getMembershipMultiplier(user.membershipType);
  points = Math.round(points * membershipMultiplier);
  
  return {
    points,
    eventsAttended,
    volunteeringDone,
    daysInCurrentMembership: daysSinceJoining
  };
}

function getMembershipMultiplier(membershipType: string): number {
  const multipliers: Record<string, number> = {
    'friend': 1.0,
    'rider': 1.2,
    'rider-duo': 1.2,
    'pro': 1.5,
    'pro-duo': 1.5
  };
  
  return multipliers[membershipType] || 1.0;
}