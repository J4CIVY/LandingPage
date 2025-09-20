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
  POINTS_SYSTEM,
  calculateFriendUpgradeRequirements,
  calculateRiderUpgradeRequirements,
  calculateProUpgradeRequirements,
  calculateLegendUpgradeRequirements,
  calculateMasterUpgradeRequirements,
  calculateLastYearPoints,
  validateDigitalParticipation,
  validateCleanRecord,
  validateDemonstrableContribution,
  validateExemplaryAttitude,
  calculateEventTypeDistribution,
  validateOutstandingProjectParticipation,
  validateOfficialRecognition,
  calculateOrganizedEventsDistribution,
  validateCommunityRecognition,
  validateDirectiveValidation,
  validateHighImpactVolunteering,
  calculateHighParticipationEvents,
  validateVolunteerCommitment,
  validateClubValues,
  calculateVolunteerContributions,
  getVolunteerBenefitsEligibility,
  // Funciones específicas para Leader
  validateLeaderRequirements,
  validateLeadershipHistory,
  validateDisciplinaryRecord,
  validateLeaderHighImpactVolunteering,
  calculateLeadershipEligibility
} from '@/data/membershipConfig';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener información completa de membresía del usuario actual
function calculateProgressToNext(currentType: MembershipType, userStats: any) {
  const progressMapping: Record<MembershipType, MembershipType | null> = {
    Friend: 'Rider',
    Rider: 'Pro', 
    Pro: 'Legend',
    Legend: 'Master',
    Master: 'Leader',
    Volunteer: null, // Volunteer es complementario
    Leader: null // Leader es el máximo nivel
  };
  
  const nextType = progressMapping[currentType];
  
  if (!nextType) {
    return {
      nextType: null,
      canProgress: false,
      progressPercentage: 100
    };
  }
  
  // Calcular progreso basado en los requisitos del siguiente nivel
  const rules = MEMBERSHIP_RULES[nextType];
  
  if (!rules || !('pointsRequired' in rules)) {
    return {
      nextType,
      canProgress: false,
      progressPercentage: 0
    };
  }
  
  const pointsProgress = Math.min(100, (userStats.points / rules.pointsRequired) * 100);
  
  return {
    nextType,
    canProgress: pointsProgress >= 100,
    progressPercentage: Math.round(pointsProgress)
  };
}

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
    
    // Obtener requisitos detallados (usa lógica especial para Friend, Rider, Pro, Legend, Master y Leader)
    let requirements: RequirementStatus[];
    
    if (currentMembershipType === 'Friend') {
      requirements = await getFriendRequirements(user, userStats);
    } else if (currentMembershipType === 'Rider') {
      requirements = await getRiderRequirements(user, userStats);
    } else if (currentMembershipType === 'Pro') {
      requirements = await getProRequirements(user, userStats);
    } else if (currentMembershipType === 'Legend') {
      requirements = await getLegendRequirements(user, userStats);
    } else if (currentMembershipType === 'Master') {
      requirements = await getMasterRequirements(user, userStats);
    } else if (currentMembershipType === 'Leader') {
      requirements = await getLeaderRequirements(user, userStats);
    } else {
      requirements = getDetailedRequirements(currentMembershipType, progress.nextType || undefined, userStats);
    }
    
    // Obtener historial de membresía
    const history = generateMembershipHistory(user);
    
    // Obtener logros/achievements
    const achievements = calculateAchievements(userStats);
    
    // Obtener ranking del usuario
    const ranking = await calculateUserRanking(user._id, userStats.points);
    
    // Obtener información de Volunteer como membresía complementaria
    const volunteerInfo = await getVolunteerStatus(user, userStats, currentMembershipType);
    
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
          nextType: progress.nextType || undefined,
          percent: progress.progressPercentage,
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
      achievements,
      volunteerInfo // Agregar información completa de Volunteer como membresía complementaria
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

async function getLegendRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Casos especiales para Legend → Master
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  
  if (currentMembershipType !== 'Legend') {
    return [];
  }
  
  try {
    const upgradeReqs = await calculateLegendUpgradeRequirements(user, userStats);
    const lastYearPoints = calculateLastYearPoints(user, userStats);
    const hasOutstandingProjectParticipation = await validateOutstandingProjectParticipation(user);
    const hasOfficialRecognition = await validateOfficialRecognition(user);
    const eventDistribution = await calculateEventTypeDistribution(user);
    const organizedEventsDistribution = await calculateOrganizedEventsDistribution(user);
    
    const requirements: RequirementStatus[] = [];
    
    // Requisito de puntos totales (18000 - doble de Legend)
    requirements.push({
      id: 'total_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos totales acumulados (doble de Legend)`,
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
    
    // Requisito de eventos organizados (10%)
    requirements.push({
      id: 'organized_events',
      label: `${upgradeReqs.organizedEventsRequired} eventos organizados directamente (10%)`,
      fulfilled: organizedEventsDistribution.totalOrganizedEvents >= upgradeReqs.organizedEventsRequired,
      progress: Math.min(100, (organizedEventsDistribution.totalOrganizedEvents / upgradeReqs.organizedEventsRequired) * 100),
      detail: `Has organizado ${organizedEventsDistribution.totalOrganizedEvents} eventos de ${upgradeReqs.organizedEventsRequired} requeridos (${organizedEventsDistribution.organizedPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de voluntariados (15 mínimo)
    requirements.push({
      id: 'volunteering',
      label: `${upgradeReqs.volunteeringRequired} participaciones en voluntariado`,
      fulfilled: userStats.volunteeringDone >= upgradeReqs.volunteeringRequired,
      progress: Math.min(100, (userStats.volunteeringDone / upgradeReqs.volunteeringRequired) * 100),
      detail: `Has completado ${userStats.volunteeringDone} de ${upgradeReqs.volunteeringRequired} voluntariados requeridos`
    });
    
    // Requisito de tiempo (4 años como Legend)
    requirements.push({
      id: 'time_as_legend',
      label: `${Math.floor(upgradeReqs.timeRequired / 365)} años como Legend (${upgradeReqs.timeRequired} días)`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días de ${upgradeReqs.timeRequired} requeridos como Legend`
    });
    
    // Requisito de participación destacada en proyectos
    requirements.push({
      id: 'outstanding_project_participation',
      label: 'Participación destacada en proyectos comunitarios, campañas sociales o actividades de impacto',
      fulfilled: hasOutstandingProjectParticipation,
      progress: hasOutstandingProjectParticipation ? 100 : 0,
      detail: hasOutstandingProjectParticipation 
        ? 'Has participado destacadamente en proyectos comunitarios e iniciativas de impacto'
        : 'Se requiere participación destacada en al menos 2 proyectos comunitarios y 1 campaña social'
    });
    
    // Requisito de reconocimiento oficial del club
    requirements.push({
      id: 'official_recognition',
      label: 'Reconocimiento oficial del club como miembro sobresaliente y confiable',
      fulfilled: hasOfficialRecognition,
      progress: hasOfficialRecognition ? 100 : 0,
      detail: hasOfficialRecognition 
        ? 'Reconocimiento oficial del club confirmado con certificaciones y menciones'
        : 'Se requiere reconocimiento oficial formal del club con al menos 2 criterios de excelencia'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Legend requirements:', error);
    return [];
  }
}

async function getMasterRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Casos especiales para Master → Leader
  const currentMembershipType = mapLegacyMembershipType(user.membershipType);
  
  if (currentMembershipType !== 'Master') {
    return [];
  }
  
  try {
    const upgradeReqs = await calculateMasterUpgradeRequirements(user, userStats);
    const lastYearPoints = calculateLastYearPoints(user, userStats);
    const hasCommunityRecognition = await validateCommunityRecognition(user);
    const hasDirectiveValidation = await validateDirectiveValidation(user);
    const hasHighImpactVolunteering = await validateHighImpactVolunteering(user);
    const eventDistribution = await calculateEventTypeDistribution(user);
    const organizedEventsDistribution = await calculateOrganizedEventsDistribution(user);
    const highParticipationEvents = await calculateHighParticipationEvents(user);
    
    const requirements: RequirementStatus[] = [];
    
    // Requisito de puntos totales (40000 - doble de Master base)
    requirements.push({
      id: 'total_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos totales acumulados (máximo nivel)`,
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
    
    // Requisito de alta participación en eventos (80% vs 50% normal)
    requirements.push({
      id: 'high_participation_events',
      label: `${upgradeReqs.highParticipationRequired}% participación en eventos oficiales (vs 50% normal)`,
      fulfilled: highParticipationEvents.meetsHighParticipation,
      progress: Math.min(100, (highParticipationEvents.participationRate / upgradeReqs.highParticipationRequired) * 100),
      detail: `Has asistido al ${highParticipationEvents.participationRate.toFixed(1)}% de eventos de ${upgradeReqs.highParticipationRequired}% requerido`
    });
    
    // Requisito de eventos comunitarios (30%)
    requirements.push({
      id: 'community_events',
      label: `${upgradeReqs.communityEventsRequired} eventos comunitarios/sociales/humanitarios (30%)`,
      fulfilled: eventDistribution.communityEvents >= upgradeReqs.communityEventsRequired,
      progress: Math.min(100, (eventDistribution.communityEvents / upgradeReqs.communityEventsRequired) * 100),
      detail: `Has asistido a ${eventDistribution.communityEvents} eventos comunitarios de ${upgradeReqs.communityEventsRequired} requeridos (${eventDistribution.communityPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de eventos educativos (30%)
    requirements.push({
      id: 'educational_events',
      label: `${upgradeReqs.educationalEventsRequired} eventos educativos (30%)`,
      fulfilled: eventDistribution.educationalEvents >= upgradeReqs.educationalEventsRequired,
      progress: Math.min(100, (eventDistribution.educationalEvents / upgradeReqs.educationalEventsRequired) * 100),
      detail: `Has asistido a ${eventDistribution.educationalEvents} eventos educativos de ${upgradeReqs.educationalEventsRequired} requeridos (${eventDistribution.educationalPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de eventos organizados (20%)
    requirements.push({
      id: 'organized_events',
      label: `${upgradeReqs.organizedEventsRequired} eventos organizados directamente (20%)`,
      fulfilled: organizedEventsDistribution.totalOrganizedEvents >= upgradeReqs.organizedEventsRequired,
      progress: Math.min(100, (organizedEventsDistribution.totalOrganizedEvents / upgradeReqs.organizedEventsRequired) * 100),
      detail: `Has organizado ${organizedEventsDistribution.totalOrganizedEvents} eventos de ${upgradeReqs.organizedEventsRequired} requeridos (${organizedEventsDistribution.organizedPercentage.toFixed(1)}% del total)`
    });
    
    // Requisito de voluntariados de alto impacto (30 mínimo)
    requirements.push({
      id: 'high_impact_volunteering',
      label: `${upgradeReqs.volunteeringRequired} participaciones en voluntariado de alto impacto organizativo`,
      fulfilled: hasHighImpactVolunteering,
      progress: hasHighImpactVolunteering ? 100 : Math.min(100, (userStats.volunteeringDone / upgradeReqs.volunteeringRequired) * 100),
      detail: hasHighImpactVolunteering 
        ? `Has completado ${upgradeReqs.volunteeringRequired}+ voluntariados en roles de alto impacto (coordinación, representación, liderazgo)`
        : `Se requieren ${upgradeReqs.volunteeringRequired} voluntariados en roles de alto impacto organizativo`
    });
    
    // Requisito de tiempo (5 años como Master)
    requirements.push({
      id: 'time_as_master',
      label: `${Math.floor(upgradeReqs.timeRequired / 365)} años como Master (${upgradeReqs.timeRequired} días)`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días de ${upgradeReqs.timeRequired} requeridos como Master`
    });
    
    // Requisito de reconocimiento comunitario
    requirements.push({
      id: 'community_recognition',
      label: 'Reconocimiento comunitario: apoyo y confianza de la mayoría de la comunidad activa',
      fulfilled: hasCommunityRecognition,
      progress: hasCommunityRecognition ? 100 : 0,
      detail: hasCommunityRecognition 
        ? 'Tienes reconocimiento mayoritario de la comunidad con endorsements, recomendaciones y validación social'
        : 'Se requiere apoyo documentado de la mayoría de la comunidad activa (endorsements, recomendaciones, votos positivos)'
    });
    
    // Requisito de validación formal de la directiva
    requirements.push({
      id: 'directive_validation',
      label: 'Validación formal de la directiva para el salto a Leader',
      fulfilled: hasDirectiveValidation,
      progress: hasDirectiveValidation ? 100 : 0,
      detail: hasDirectiveValidation 
        ? 'Validación formal aprobada por la directiva con recomendaciones y assessments oficiales'
        : 'Se requiere validación formal de la directiva con aprobación oficial y recomendaciones del consejo'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Master requirements:', error);
    return [];
  }
}

async function getVolunteerStatus(user: any, userStats: any, currentMembershipType: MembershipType) {
  // Función especial para manejar Volunteer como membresía complementaria
  
  if (!user.volunteer) {
    return null; // No es volunteer
  }
  
  try {
    const volunteerContributions = await calculateVolunteerContributions(user);
    const hasCommitment = await validateVolunteerCommitment(user);
    const hasValuesAlignment = await validateClubValues(user);
    const benefitsEligibility = await getVolunteerBenefitsEligibility(user, currentMembershipType);
    
    const volunteerRequirements: RequirementStatus[] = [];
    
    // Requisito de compromiso activo
    volunteerRequirements.push({
      id: 'active_commitment',
      label: 'Disposición para participar activamente en actividades BSKMT',
      fulfilled: hasCommitment,
      progress: hasCommitment ? 100 : 0,
      detail: hasCommitment 
        ? 'Compromiso activo demostrado con participación consistente en actividades'
        : 'Se requiere mayor participación activa en actividades y eventos del club'
    });
    
    // Requisito de alineación con valores
    volunteerRequirements.push({
      id: 'club_values_alignment',
      label: 'Compromiso riguroso con valores del club: respeto, seguridad, compañerismo y pasión',
      fulfilled: hasValuesAlignment,
      progress: hasValuesAlignment ? 100 : 0,
      detail: hasValuesAlignment 
        ? 'Alineación confirmada con valores BSKMT: respeto, seguridad, compañerismo y pasión por motociclismo'
        : 'Se requiere demostrar mayor alineación con los valores fundamentales del club'
    });
    
    // Requisito de contribución mínima
    volunteerRequirements.push({
      id: 'minimum_contribution',
      label: `${MEMBERSHIP_RULES.Volunteer.requirements?.minimumContribution || 2} actividades voluntarias mensuales`,
      fulfilled: volunteerContributions.meetsMinimumContribution,
      progress: Math.min(100, (volunteerContributions.monthlyAverage / (MEMBERSHIP_RULES.Volunteer.requirements?.minimumContribution || 2)) * 100),
      detail: `Promedio actual: ${volunteerContributions.monthlyAverage.toFixed(1)} actividades mensuales de ${MEMBERSHIP_RULES.Volunteer.requirements?.minimumContribution || 2} requeridas`
    });
    
    return {
      isVolunteer: true,
      status: (hasCommitment && hasValuesAlignment && volunteerContributions.meetsMinimumContribution ? 'active' : 'pending') as 'active' | 'pending' | 'inactive',
      requirements: volunteerRequirements,
      contributions: volunteerContributions,
      benefitsEligibility,
      specialFeatures: {
        isComplementary: true,
        enhancesMainMembership: true,
        flexibleDuration: true,
        additionalPoints: true
      }
    };
    
  } catch (error) {
    console.error('Error calculating Volunteer status:', error);
    return null;
  }
}

async function getLeaderRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // Función especializada para evaluar requisitos de Leader
  
  try {
    const upgradeReqs = MEMBERSHIP_RULES.Leader;
    const requirements: RequirementStatus[] = [];
    
    // Validaciones específicas de Leader
    const basicRequirements = await validateLeaderRequirements(user);
    const leadershipHistory = await validateLeadershipHistory(user);
    const disciplinaryRecord = await validateDisciplinaryRecord(user);
    const highImpactVolunteering = await validateLeaderHighImpactVolunteering(user);
    
    // Requisito básico: Ser Master
    requirements.push({
      id: 'must_be_master',
      label: 'Membresía Master activa (requisito obligatorio)',
      fulfilled: basicRequirements.isMaster,
      progress: basicRequirements.isMaster ? 100 : 0,
      detail: basicRequirements.isMaster 
        ? 'Tienes membresía Master activa, cumpliendo el requisito básico para Leader'
        : 'Debes tener membresía Master activa para postular a Leader'
    });
    
    // Requisito básico: Ser Volunteer activo
    requirements.push({
      id: 'must_be_active_volunteer',
      label: 'Membresía Volunteer activa (requisito obligatorio)',
      fulfilled: basicRequirements.isActiveVolunteer,
      progress: basicRequirements.isActiveVolunteer ? 100 : 0,
      detail: basicRequirements.isActiveVolunteer 
        ? 'Tienes membresía Volunteer activa, demostrando compromiso operativo'
        : 'Debes estar activo como Volunteer para demostrar experiencia operativa'
    });
    
    // Requisito de puntos mínimos
    requirements.push({
      id: 'minimum_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos acumulados mínimos`,
      fulfilled: basicRequirements.hasMinimumPoints,
      progress: Math.min(100, ((user.points || 0) / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${(user.points || 0).toLocaleString()} puntos de ${upgradeReqs.pointsRequired.toLocaleString()} requeridos`
    });
    
    // Requisito de tiempo como Master
    requirements.push({
      id: 'years_as_master',
      label: '5 años mínimos como Master',
      fulfilled: basicRequirements.hasRequiredMasterTime,
      progress: Math.min(100, (basicRequirements.yearsAsMaster / 5) * 100),
      detail: `Tienes ${basicRequirements.yearsAsMaster} años como Master de 5 años requeridos`
    });
    
    // Requisito de asistencia a eventos
    requirements.push({
      id: 'event_attendance_rate',
      label: '80% asistencia a eventos oficiales',
      fulfilled: leadershipHistory.meetsAttendanceRequirement,
      progress: Math.min(100, leadershipHistory.attendanceRate),
      detail: `Has asistido al ${leadershipHistory.attendanceRate}% de eventos oficiales (${leadershipHistory.totalEventsAttended} eventos)`
    });
    
    // Requisito de liderazgo demostrado en eventos
    requirements.push({
      id: 'leadership_events',
      label: '≥10% eventos donde demostró liderazgo/coorganización',
      fulfilled: leadershipHistory.meetsLeadershipRequirement,
      progress: Math.min(100, leadershipHistory.leadershipEventsRate * 10),
      detail: `Has liderado/coorganizado ${leadershipHistory.leadershipEventsRate}% de eventos (${leadershipHistory.totalLeadershipEvents} eventos con liderazgo)`
    });
    
    // Requisito de éxito en eventos liderados
    requirements.push({
      id: 'leadership_success_rate',
      label: '100% éxito en eventos liderados (resultado positivo y feedback)',
      fulfilled: leadershipHistory.hasSuccessfulLeadership,
      progress: leadershipHistory.leadershipSuccessRate,
      detail: `${leadershipHistory.leadershipSuccessRate}% de éxito en eventos liderados (${leadershipHistory.successfulLeadershipEventsCount}/${leadershipHistory.totalLeadershipEvents})`
    });
    
    // Requisito de voluntariados de alto impacto
    requirements.push({
      id: 'high_impact_volunteering',
      label: '30 participaciones en roles de alto impacto',
      fulfilled: highImpactVolunteering.meetsHighImpactRequirement,
      progress: Math.min(100, (highImpactVolunteering.totalHighImpactActivities / 30) * 100),
      detail: `Has participado en ${highImpactVolunteering.totalHighImpactActivities} actividades de alto impacto de 30 requeridas`
    });
    
    // Requisito de historial disciplinario limpio
    requirements.push({
      id: 'clean_disciplinary_record',
      label: 'Historial disciplinario limpio (sin sanciones relevantes)',
      fulfilled: disciplinaryRecord.cleanRecord,
      progress: disciplinaryRecord.cleanRecord ? 100 : 0,
      detail: disciplinaryRecord.cleanRecord 
        ? 'Tienes historial disciplinario limpio sin sanciones relevantes'
        : `Historial con sanciones: ${disciplinaryRecord.suspensionsCount} suspensiones, ${disciplinaryRecord.graveWarningsCount} amonestaciones graves, ${disciplinaryRecord.ruleViolationsCount} violaciones`
    });
    
    // Proceso de postulación formal
    requirements.push({
      id: 'formal_application_process',
      label: 'Proceso de postulación formal (Plan de Liderazgo + Avales)',
      fulfilled: false, // TODO: Implementar lógica real de postulación
      progress: 0,
      detail: 'Requiere: Plan de Liderazgo, formulario de postulación, avales de 3 Leaders + 5 Masters activos'
    });
    
    // Proceso de evaluación
    requirements.push({
      id: 'evaluation_process',
      label: 'Proceso de evaluación y ratificación',
      fulfilled: false, // TODO: Implementar lógica real de evaluación
      progress: 0,
      detail: 'Requiere: revisión por Comisión Evaluadora, entrevista pública, votación consultiva (50%+1), ratificación presidencial'
    });
    
    // Vacante disponible
    requirements.push({
      id: 'vacancy_available',
      label: 'Vacante disponible en roles administrativos',
      fulfilled: true, // TODO: Implementar lógica real de vacantes
      progress: 100,
      detail: 'Existe vacante disponible en roles administrativos del club'
    });
    
    return requirements;
    
  } catch (error) {
    console.error('Error calculating Leader requirements:', error);
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