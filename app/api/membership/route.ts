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
  POINTS_SYSTEM,
  calculateFriendUpgradeRequirements,
  calculateMinimumDaysForUpgrade,
  calculateRequiredEventsForFriend,
  calculateRiderUpgradeRequirements,
  validateDigitalParticipation,
  validateCleanRecord,
  calculateLastYearPoints,
  calculateProUpgradeRequirements,
  validateDemonstrableContribution,
  calculateEventTypeDistribution,
  validateExemplaryAttitude
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
    
    // Obtener requisitos detallados (usa lógica especial para Friend, Rider y Pro)
    let requirements: RequirementStatus[];
    
    if (currentMembershipType === 'Friend') {
      requirements = await getFriendRequirements(user, userStats);
    } else if (currentMembershipType === 'Rider') {
      requirements = await getRiderRequirements(user, userStats);
    } else if (currentMembershipType === 'Pro') {
      requirements = await getProRequirements(user, userStats);
    } else {
      requirements = getDetailedRequirements(currentMembershipType, progress.nextType, userStats);
    }
    
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
  
  // Calcular eventos confirmados asistidos (diferente de solo registrados)
  // TODO: Implementar lógica real para diferenciar eventos confirmados vs registrados
  const confirmedEventsAttended = user.confirmedEvents?.length || Math.floor(eventsAttended * 0.8); // 80% de eventos registrados se asumen confirmados
  
  points += eventsAttended * POINTS_SYSTEM.EVENT_ATTENDANCE;
  
  // Estimar voluntariados basándose en pqrsd o actividad
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5); // 1 voluntariado cada 5 eventos
  points += volunteeringDone * POINTS_SYSTEM.VOLUNTEERING;
  
  // Calcular días en membresía actual (por ahora, total de días)
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  const daysInCurrentMembership = daysSinceJoining; // Simplificado por ahora
  
  // Calcular eventos desde Friend (para Pro → Legend)
  const totalEventsFromFriend = eventsAttended; // Simplificado - en producción sería desde que se volvió Friend
  
  return {
    points,
    eventsAttended,
    confirmedEventsAttended, // Nuevo campo para eventos confirmados
    volunteeringDone,
    daysInCurrentMembership,
    totalDaysAsMember: daysSinceJoining,
    totalEventsFromFriend, // Nuevo campo para Pro → Legend
    isVolunteer: user.volunteer || false
  };
}

async function getFriendRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Casos especiales para Friend → Rider
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  
  if (currentMembershipType !== 'Friend') {
    return [];
  }
  
  try {
    const upgradeReqs = await calculateFriendUpgradeRequirements(user, userStats);
    const requirements: RequirementStatus[] = [];
    
    // Requisito de puntos
    requirements.push({
      id: 'points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos mínimos`,
      fulfilled: userStats.points >= upgradeReqs.pointsRequired,
      progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos de ${upgradeReqs.pointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de eventos (dinámico)
    requirements.push({
      id: 'events',
      label: `${upgradeReqs.eventsRequired} eventos asistidos (50% del año)`,
      fulfilled: userStats.eventsAttended >= upgradeReqs.eventsRequired,
      progress: Math.min(100, (userStats.eventsAttended / upgradeReqs.eventsRequired) * 100),
      detail: `Has asistido a ${userStats.eventsAttended} de ${upgradeReqs.eventsRequired} eventos requeridos este año`
    });
    
    // Requisito de tiempo (365/366 días)
    requirements.push({
      id: 'time',
      label: `${upgradeReqs.minimumDaysActual} días como Friend`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días de ${upgradeReqs.minimumDaysActual} requeridos`
    });
    
    // Requisito de historial limpio (siempre cumplido por ahora)
    requirements.push({
      id: 'clean_record',
      label: 'Historial limpio (sin reportes disciplinarios)',
      fulfilled: true, // TODO: Implementar lógica real de verificación
      progress: 100,
      detail: 'Sin faltas al código de ética del club'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Friend requirements:', error);
    return [];
  }
}

async function getRiderRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Casos especiales para Rider → Pro
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  
  if (currentMembershipType !== 'Rider') {
    return [];
  }
  
  try {
    const upgradeReqs = await calculateRiderUpgradeRequirements(user, userStats);
    const lastYearPoints = calculateLastYearPoints(user, userStats);
    const hasDigitalParticipation = await validateDigitalParticipation(user);
    const hasCleanRecord = await validateCleanRecord(user);
    
    const requirements: RequirementStatus[] = [];
    
    // Requisito de puntos totales (3000)
    requirements.push({
      id: 'total_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos totales acumulados`,
      fulfilled: userStats.points >= upgradeReqs.pointsRequired,
      progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos de ${upgradeReqs.pointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de puntos último año (1000)
    requirements.push({
      id: 'last_year_points',
      label: `${upgradeReqs.lastYearPointsRequired.toLocaleString()} puntos obtenidos el último año`,
      fulfilled: lastYearPoints >= upgradeReqs.lastYearPointsRequired,
      progress: Math.min(100, (lastYearPoints / upgradeReqs.lastYearPointsRequired) * 100),
      detail: `Has obtenido ${lastYearPoints.toLocaleString()} puntos este año de ${upgradeReqs.lastYearPointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de eventos confirmados acumulados (50%)
    requirements.push({
      id: 'confirmed_events',
      label: `${upgradeReqs.eventsRequired} eventos confirmados asistidos (50% del histórico)`,
      fulfilled: userStats.confirmedEventsAttended >= upgradeReqs.eventsRequired,
      progress: Math.min(100, (userStats.confirmedEventsAttended / upgradeReqs.eventsRequired) * 100),
      detail: `Has asistido confirmadamente a ${userStats.confirmedEventsAttended} de ${upgradeReqs.eventsRequired} eventos requeridos`
    });
    
    // Requisito de voluntariado (al menos 1)
    requirements.push({
      id: 'volunteering',
      label: `${upgradeReqs.volunteeringRequired} voluntariado operativo completado`,
      fulfilled: userStats.volunteeringDone >= upgradeReqs.volunteeringRequired,
      progress: Math.min(100, (userStats.volunteeringDone / upgradeReqs.volunteeringRequired) * 100),
      detail: `Has completado ${userStats.volunteeringDone} de ${upgradeReqs.volunteeringRequired} voluntariados requeridos`
    });
    
    // Requisito de tiempo (2 años como Rider)
    requirements.push({
      id: 'time_as_rider',
      label: `${Math.floor(upgradeReqs.timeRequired / 365)} años como Rider (${upgradeReqs.timeRequired} días)`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días de ${upgradeReqs.timeRequired} requeridos como Rider`
    });
    
    // Requisito de participación digital activa
    requirements.push({
      id: 'digital_participation',
      label: 'Participación digital activa en la comunidad',
      fulfilled: hasDigitalParticipation,
      progress: hasDigitalParticipation ? 100 : 0,
      detail: hasDigitalParticipation 
        ? 'Participación activa confirmada en foros y grupos oficiales'
        : 'Se requiere mayor participación en la comunidad digital BSKMT'
    });
    
    // Requisito de historial limpio
    requirements.push({
      id: 'clean_record',
      label: 'Historial limpio (sin faltas disciplinarias)',
      fulfilled: hasCleanRecord,
      progress: hasCleanRecord ? 100 : 0,
      detail: hasCleanRecord 
        ? 'Sin reportes disciplinarios ni violaciones de ética'
        : 'Existen reportes disciplinarios que impiden el ascenso'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Rider requirements:', error);
    return [];
  }
}

async function getProRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Casos especiales para Pro → Legend
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  
  if (currentMembershipType !== 'Pro') {
    return [];
  }
  
  try {
    const upgradeReqs = await calculateProUpgradeRequirements(user, userStats);
    const lastYearPoints = calculateLastYearPoints(user, userStats);
    const hasDemonstrableContribution = await validateDemonstrableContribution(user);
    const hasExemplaryAttitude = await validateExemplaryAttitude(user);
    const eventDistribution = await calculateEventTypeDistribution(user);
    
    const requirements: RequirementStatus[] = [];
    
    // Requisito de puntos totales (9000 - triple de Pro)
    requirements.push({
      id: 'total_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos totales acumulados (triple de Pro)`,
      fulfilled: userStats.points >= upgradeReqs.pointsRequired,
      progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos de ${upgradeReqs.pointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de puntos último año (1000)
    requirements.push({
      id: 'last_year_points',
      label: `${upgradeReqs.lastYearPointsRequired.toLocaleString()} puntos obtenidos el último año`,
      fulfilled: lastYearPoints >= upgradeReqs.lastYearPointsRequired,
      progress: Math.min(100, (lastYearPoints / upgradeReqs.lastYearPointsRequired) * 100),
      detail: `Has obtenido ${lastYearPoints.toLocaleString()} puntos este año de ${upgradeReqs.lastYearPointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de eventos oficiales generales (50% desde Friend)
    requirements.push({
      id: 'general_events',
      label: `${upgradeReqs.eventsRequired} eventos oficiales generales (50% desde Friend)`,
      fulfilled: userStats.totalEventsFromFriend >= upgradeReqs.eventsRequired,
      progress: Math.min(100, (userStats.totalEventsFromFriend / upgradeReqs.eventsRequired) * 100),
      detail: `Has asistido a ${userStats.totalEventsFromFriend} eventos de ${upgradeReqs.eventsRequired} requeridos desde Friend`
    });
    
    // Requisito de eventos comunitarios (20%)
    requirements.push({
      id: 'community_events',
      label: `${upgradeReqs.communityEventsRequired} eventos comunitarios/sociales/humanitarios (20%)`,
      fulfilled: eventDistribution.communityEvents >= upgradeReqs.communityEventsRequired,
      progress: Math.min(100, (eventDistribution.communityEvents / upgradeReqs.communityEventsRequired) * 100),
      detail: `Has asistido a ${eventDistribution.communityEvents} eventos comunitarios de ${upgradeReqs.communityEventsRequired} requeridos (${eventDistribution.communityPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de eventos educativos (20%)
    requirements.push({
      id: 'educational_events',
      label: `${upgradeReqs.educationalEventsRequired} eventos educativos (20%)`,
      fulfilled: eventDistribution.educationalEvents >= upgradeReqs.educationalEventsRequired,
      progress: Math.min(100, (eventDistribution.educationalEvents / upgradeReqs.educationalEventsRequired) * 100),
      detail: `Has asistido a ${eventDistribution.educationalEvents} eventos educativos de ${upgradeReqs.educationalEventsRequired} requeridos (${eventDistribution.educationalPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de voluntariados (5 mínimo)
    requirements.push({
      id: 'volunteering',
      label: `${upgradeReqs.volunteeringRequired} participaciones en voluntariado`,
      fulfilled: userStats.volunteeringDone >= upgradeReqs.volunteeringRequired,
      progress: Math.min(100, (userStats.volunteeringDone / upgradeReqs.volunteeringRequired) * 100),
      detail: `Has completado ${userStats.volunteeringDone} de ${upgradeReqs.volunteeringRequired} voluntariados requeridos`
    });
    
    // Requisito de tiempo (3 años como Pro)
    requirements.push({
      id: 'time_as_pro',
      label: `${Math.floor(upgradeReqs.timeRequired / 365)} años como Pro (${upgradeReqs.timeRequired} días)`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días de ${upgradeReqs.timeRequired} requeridos como Pro`
    });
    
    // Requisito de contribución demostrable
    requirements.push({
      id: 'demonstrable_contribution',
      label: 'Contribución demostrable en organización/apoyo de actividades',
      fulfilled: hasDemonstrableContribution,
      progress: hasDemonstrableContribution ? 100 : 0,
      detail: hasDemonstrableContribution 
        ? 'Has participado en organización o apoyo de actividades del club'
        : 'Se requiere participación demostrable en organización o apoyo de actividades'
    });
    
    // Requisito de historial limpio y actitud ejemplar
    requirements.push({
      id: 'exemplary_attitude',
      label: 'Historial limpio y actitud ejemplar dentro y fuera de eventos',
      fulfilled: hasExemplaryAttitude,
      progress: hasExemplaryAttitude ? 100 : 0,
      detail: hasExemplaryAttitude 
        ? 'Historial limpio con actitud ejemplar confirmada'
        : 'Se requiere demostrar actitud ejemplar constante dentro y fuera de eventos'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Pro requirements:', error);
    return [];
  }
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