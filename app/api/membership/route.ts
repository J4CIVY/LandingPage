import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { 
  MembershipResponse, 
  MembershipType, 
  RequirementStatus, 
  Achievement,
  MembershipHistoryEntry 
} from '@/types/membership';
import { 
  MEMBERSHIP_RULES, 
  MEMBERSHIP_CONFIG, 
  MEMBERSHIP_BENEFITS,
  calculateProgressToNext,
  canUpgradeToMembership,
  POINTS_SYSTEM 
} from '@/data/membershipConfig';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener información completa de membresía del usuario actual
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
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Convertir membershipType existente al nuevo sistema
    const currentMembershipType = mapLegacyMembershipType(user.membershipType);
    
    // Calcular estadísticas del usuario
    const userStats = await calculateUserStats(user);
    
    // Calcular progreso hacia siguiente membresía
    const progress = calculateProgressToNext(currentMembershipType, userStats);
    
    // Obtener requisitos detallados
    const requirements = getDetailedRequirements(currentMembershipType, progress.nextType, userStats);
    
    // Obtener historial de membresía
    const history = generateMembershipHistory(user);
    
    // Obtener logros/achievements
    const achievements = calculateAchievements(userStats);
    
    // Obtener ranking del usuario
    const ranking = await calculateUserRanking(user._id, userStats.points);
    
    // Construir respuesta según la interfaz MembershipResponse
    const membershipResponse: MembershipResponse = {
      userId: user._id.toString(),
      membership: {
        type: currentMembershipType,
        startDate: user.joinDate?.toISOString() || new Date().toISOString(),
        expiryDate: calculateExpiryDate(user),
        status: calculateMembershipStatus(user),
        points: userStats.points,
        benefits: MEMBERSHIP_BENEFITS[currentMembershipType].benefits,
        progress: {
          nextType: progress.nextType,
          percent: progress.percent,
          requirements
        },
        history,
        volunteer: user.volunteer || false,
        leaderApplication: {
          status: 'none', // TODO: Implementar lógica real
          appliedAt: undefined,
          note: undefined
        }
      },
      ranking,
      achievements
    };

    return NextResponse.json({
      success: true,
      data: membershipResponse
    });

  } catch (error) {
    console.error('Error fetching membership data:', error);
    
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

// Funciones auxiliares

function mapLegacyMembershipType(legacyType: string): MembershipType {
  const mapping: Record<string, MembershipType> = {
    'friend': 'Friend',
    'rider': 'Rider',
    'rider-duo': 'Rider',
    'pro': 'Pro',
    'pro-duo': 'Pro',
    // Por defecto Friend para tipos no reconocidos
  };
  
  return mapping[legacyType] || 'Friend';
}

async function calculateUserStats(user: any) {
  // Calcular estadísticas basándose en los datos existentes del usuario
  const joinDate = user.joinDate || user.createdAt;
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular puntos basándose en actividad estimada
  let points = 0;
  
  // Puntos base por tiempo como miembro
  const monthsAsMember = Math.floor(daysSinceJoining / 30);
  points += monthsAsMember * POINTS_SYSTEM.MONTHLY_BONUS;
  
  // Estimar eventos asistidos basándose en registeredEvents o tiempo como miembro
  const eventsAttended = user.registeredEvents?.length || Math.floor(daysSinceJoining / 60); // 1 evento cada 2 meses aprox
  points += eventsAttended * POINTS_SYSTEM.EVENT_ATTENDANCE;
  
  // Estimar voluntariados basándose en pqrsd o actividad
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5); // 1 voluntariado cada 5 eventos
  points += volunteeringDone * POINTS_SYSTEM.VOLUNTEERING;
  
  // Calcular días en membresía actual (por ahora, total de días)
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  const daysInCurrentMembership = daysSinceJoining; // Simplificado por ahora
  
  return {
    points,
    eventsAttended,
    volunteeringDone,
    daysInCurrentMembership,
    totalDaysAsMember: daysSinceJoining,
    isVolunteer: user.volunteer || false
  };
}

function getDetailedRequirements(
  currentType: MembershipType, 
  nextType: MembershipType | undefined, 
  userStats: any
): RequirementStatus[] {
  if (!nextType) {
    return [];
  }
  
  const rules = MEMBERSHIP_RULES[nextType];
  const requirements: RequirementStatus[] = [];
  
  if ('pointsRequired' in rules) {
    requirements.push({
      id: 'points',
      label: `${rules.pointsRequired.toLocaleString()} puntos`,
      fulfilled: userStats.points >= rules.pointsRequired,
      progress: Math.min(100, (userStats.points / rules.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos`
    });
  }
  
  if ('eventsRequired' in rules) {
    requirements.push({
      id: 'events',
      label: `${rules.eventsRequired} eventos asistidos`,
      fulfilled: userStats.eventsAttended >= rules.eventsRequired,
      progress: Math.min(100, (userStats.eventsAttended / rules.eventsRequired) * 100),
      detail: `Has asistido a ${userStats.eventsAttended} eventos`
    });
  }
  
  if ('volunteeringRequired' in rules) {
    requirements.push({
      id: 'volunteering',
      label: `${rules.volunteeringRequired} voluntariados`,
      fulfilled: userStats.volunteeringDone >= rules.volunteeringRequired,
      progress: Math.min(100, (userStats.volunteeringDone / rules.volunteeringRequired) * 100),
      detail: `Has completado ${userStats.volunteeringDone} voluntariados`
    });
  }
  
  if ('timeRequired' in rules) {
    const daysNeeded = rules.timeRequired;
    requirements.push({
      id: 'time',
      label: `${daysNeeded} días en membresía actual`,
      fulfilled: userStats.daysInCurrentMembership >= daysNeeded,
      progress: Math.min(100, (userStats.daysInCurrentMembership / daysNeeded) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días`
    });
  }
  
  return requirements;
}

function generateMembershipHistory(user: any): MembershipHistoryEntry[] {
  const history: MembershipHistoryEntry[] = [];
  
  // Historial básico basado en datos del usuario
  const joinDate = user.joinDate || user.createdAt;
  
  history.push({
    date: joinDate.toISOString(),
    action: `Se unió como ${user.membershipType || 'Friend'}`,
    by: 'Sistema'
  });
  
  // TODO: Agregar más entradas basándose en datos reales del historial
  // Esto se podría complementar con una colección dedicada de historial
  
  return history.reverse(); // Más reciente primero
}

function calculateAchievements(userStats: any): Achievement[] {
  const achievements: Achievement[] = [];
  
  // Logros basados en estadísticas
  if (userStats.eventsAttended >= 1) {
    achievements.push({
      id: 'first_event',
      name: 'Primer Evento',
      description: 'Asististe a tu primer evento BSK',
      icon: 'FaCalendarCheck',
      category: 'events',
      earnedAt: new Date().toISOString(), // Simplificado
      points: 100,
      requirements: ['Asistir a 1 evento']
    });
  }
  
  if (userStats.eventsAttended >= 5) {
    achievements.push({
      id: 'event_enthusiast',
      name: 'Entusiasta de Eventos',
      description: 'Asististe a 5 eventos',
      icon: 'FaStar',
      category: 'events',
      earnedAt: new Date().toISOString(),
      points: 250,
      requirements: ['Asistir a 5 eventos']
    });
  }
  
  if (userStats.volunteeringDone >= 1) {
    achievements.push({
      id: 'first_volunteer',
      name: 'Primer Voluntariado',
      description: 'Completaste tu primer voluntariado',
      icon: 'FaHeart',
      category: 'volunteering',
      earnedAt: new Date().toISOString(),
      points: 200,
      requirements: ['Completar 1 voluntariado']
    });
  }
  
  if (userStats.points >= 1000) {
    achievements.push({
      id: 'point_collector',
      name: 'Coleccionista de Puntos',
      description: 'Alcanzaste 1,000 puntos',
      icon: 'FaTrophy',
      category: 'points',
      earnedAt: new Date().toISOString(),
      points: 500,
      requirements: ['Alcanzar 1,000 puntos']
    });
  }
  
  return achievements;
}

function calculateExpiryDate(user: any): string | null {
  // Por ahora, calcular 1 año desde la fecha de unión
  const joinDate = user.joinDate || user.createdAt;
  const expiryDate = new Date(joinDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return expiryDate.toISOString();
}

function calculateMembershipStatus(user: any): 'active' | 'expired' | 'cancelled' | 'pending' {
  // Lógica simplificada por ahora
  if (!user.isActive) return 'cancelled';
  
  const expiryDate = calculateExpiryDate(user);
  if (expiryDate && new Date(expiryDate) < new Date()) {
    return 'expired';
  }
  
  return 'active';
}

async function calculateUserRanking(userId: string, userPoints: number) {
  try {
    // Contar usuarios con más puntos (simplificado)
    // En una implementación real, esto debería usar una colección de estadísticas
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Simulación del ranking basado en puntos
    // En producción, esto debería ser una consulta más sofisticada
    const estimatedPosition = Math.max(1, Math.floor(totalUsers * (1 - (userPoints / 100000))));
    
    return {
      position: estimatedPosition,
      totalMembers: totalUsers,
      points: userPoints
    };
  } catch (error) {
    console.error('Error calculating ranking:', error);
    return {
      position: 1,
      totalMembers: 1,
      points: userPoints
    };
  }
}