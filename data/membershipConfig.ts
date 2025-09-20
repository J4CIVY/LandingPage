import { MembershipType, MembershipRules, MembershipConfig, MembershipBenefits } from '@/types/membership';

// Reglas de negocio para cada tipo de membresía
export const MEMBERSHIP_RULES: MembershipRules = {
  Friend: {
    pointsRequired: 0,
    eventsRequired: 0,
    volunteeringRequired: 0,
    timeRequired: 0, // No tiene requisitos de entrada
    // Para escalar a Rider desde Friend:
    nextLevelRequirements: {
      pointsRequired: 1000,
      eventsRequired: 0, // Se calculará dinámicamente (50% de eventos del año)
      volunteeringRequired: 0, // No obligatorio pero acelera ascenso
      timeRequired: 365, // 365 días (1 año normal) o 366 (año bisiesto)
      minimumDaysForUpgrade: 365,
      leapYearDays: 366,
      eventPercentageRequired: 50, // 50% de eventos oficiales del año
    }
  },
  Rider: {
    // Requisitos para obtener Rider (desde Friend)
    pointsRequired: 1000, // Puntos mínimos acumulados
    eventsRequired: 0, // Se calcula dinámicamente (50% eventos del año como Friend)
    volunteeringRequired: 0, // No obligatorio para Rider
    timeRequired: 365, // 1 año como Friend
    // Configuración específica Rider
    specialRequirements: {
      confirmedEventsOnly: true, // Solo eventos con asistencia confirmada
      cleanRecord: true, // Historial limpio obligatorio
      fromMembershipType: 'Friend' // Solo desde Friend
    }
  },
  Pro: {
    // Requisitos para obtener Pro (desde Rider)
    pointsRequired: 3000, // 3000 puntos totales acumulados
    eventsRequired: 0, // Se calcula dinámicamente (50% eventos acumulados confirmados)
    volunteeringRequired: 1, // Al menos 1 voluntariado operativo
    timeRequired: 730, // 2 años como Rider (730 días)
    // Configuración específica Pro
    specialRequirements: {
      lastYearPoints: 1000, // 1000 puntos obtenidos el último año
      confirmedEventsOnly: true, // Solo eventos confirmados asistidos
      digitalParticipation: true, // Participación digital activa
      cleanRecord: true, // Sin faltas disciplinarias
      fromMembershipType: 'Rider' // Solo desde Rider
    }
  },
  Legend: {
    // Requisitos para obtener Legend (desde Pro)
    pointsRequired: 9000, // 9000 puntos totales acumulados (triple de Pro)
    eventsRequired: 0, // Se calcula dinámicamente (50% eventos generales + tipos específicos)
    volunteeringRequired: 5, // Mínimo 5 participaciones en voluntariado
    timeRequired: 1095, // 3 años como Pro (1095 días)
    // Configuración específica Legend
    specialRequirements: {
      lastYearPoints: 1000, // 1000 puntos obtenidos el último año
      confirmedEventsOnly: true, // Solo eventos confirmados asistidos
      eventTypeDistribution: {
        communityEvents: 20, // 20% eventos comunitarios/sociales/humanitarios
        educationalEvents: 20 // 20% eventos educativos
      },
      demonstrableContribution: true, // Participación en organización/apoyo actividades
      cleanRecord: true, // Historial limpio y actitud ejemplar
      fromMembershipType: 'Pro' // Solo desde Pro
    }
  },
  Master: {
    pointsRequired: 50000,
    eventsRequired: 50,
    volunteeringRequired: 15,
    timeRequired: 365, // días como Legend
  },
  Volunteer: {
    canAttachTo: ['Friend', 'Rider', 'Pro', 'Legend', 'Master', 'Leader'],
    additionalBenefits: [
      'Reconocimiento especial en eventos',
      'Acceso prioritario a capacitaciones',
      'Certificaciones de voluntariado',
      'Puntos adicionales por actividades'
    ],
  },
  Leader: {
    pointsRequired: 100000,
    eventsRequired: 100,
    volunteeringRequired: 50,
    timeRequired: 365, // días como Master
    mustBeVolunteer: true,
    mustBeMaster: true,
    requiresApplication: true,
  },
};

// Configuración visual para cada tipo de membresía
export const MEMBERSHIP_CONFIG: MembershipConfig = {
  Friend: {
    name: 'Friend',
    description: 'Membresía gratuita de entrada - Nivel inicial para conocer BSKMT',
    color: '#10B981', // green-500
    bgColor: '#ECFDF5', // green-50
    textColor: '#065F46', // green-800
    icon: 'FaUserFriends',
    badge: '🤝',
    gradient: 'from-green-400 to-green-600',
  },
  Rider: {
    name: 'Rider',
    description: 'Miembro activo comprometido - Participante oficial de BSKMT',
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
    textColor: '#1E40AF', // blue-800
    icon: 'FaMotorcycle',
    badge: '🏍️',
    gradient: 'from-blue-400 to-blue-600',
  },
  Pro: {
    name: 'Pro',
    description: 'Miembro comprometido y activo - Verdadero colaborador del club',
    color: '#8B5CF6', // violet-500
    bgColor: '#F5F3FF', // violet-50
    textColor: '#5B21B6', // violet-800
    icon: 'FaMedal',
    badge: '🏆',
    gradient: 'from-violet-400 to-violet-600',
  },
  Legend: {
    name: 'Legend',
    description: 'Leyenda del club con contribuciones excepcionales',
    color: '#F59E0B', // amber-500
    bgColor: '#FFFBEB', // amber-50
    textColor: '#92400E', // amber-800
    icon: 'FaCrown',
    badge: '👑',
    gradient: 'from-amber-400 to-amber-600',
  },
  Master: {
    name: 'Master',
    description: 'Maestro del motociclismo y mentor de la comunidad',
    color: '#EF4444', // red-500
    bgColor: '#FEF2F2', // red-50
    textColor: '#991B1B', // red-800
    icon: 'FaGem',
    badge: '💎',
    gradient: 'from-red-400 to-red-600',
  },
  Volunteer: {
    name: 'Volunteer',
    description: 'Voluntario comprometido con la comunidad',
    color: '#06B6D4', // cyan-500
    bgColor: '#ECFEFF', // cyan-50
    textColor: '#155E75', // cyan-800
    icon: 'FaHeart',
    badge: '❤️',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  Leader: {
    name: 'Leader',
    description: 'Líder y guía de la comunidad BSK',
    color: '#7C3AED', // violet-600
    bgColor: '#F3E8FF', // violet-100
    textColor: '#4C1D95', // violet-900
    icon: 'FaUserTie',
    badge: '⭐',
    gradient: 'from-violet-500 to-purple-600',
  },
};

// Beneficios por tipo de membresía
export const MEMBERSHIP_BENEFITS: MembershipBenefits = {
  Friend: {
    name: 'Friend',
    description: 'Nivel inicial - Puerta de entrada al club BSK',
    color: '#10B981',
    icon: 'FaUserFriends',
    benefits: [
      'Acceso a la comunidad digital BSKMT (redes, grupos, newsletter)',
      'Participación en eventos abiertos (rodadas públicas, encuentros comunitarios)',
      'Acceso limitado a la plataforma web (noticias, calendario, contenidos básicos)',
      'Descuentos iniciales en aliados comerciales (5-10% en tiendas y talleres)',
      'Registro en el sistema de puntos',
      'Acceso a PQRSDF limitado (sugerencias e inquietudes sin prioridad)',
      'Reconocimiento digital como miembro activo con distintivo Friend',
      'Compatibilidad con membresía Volunteer'
    ],
    priority: 1,
  },
  Rider: {
    name: 'Rider',
    description: 'Miembro activo - Primer nivel de compromiso real con BSKMT',
    color: '#3B82F6',
    icon: 'FaMotorcycle',
    benefits: [
      'Todos los beneficios de Friend',
      'Acceso a rodadas oficiales del club (no solo abiertas)',
      'Acceso a eventos internos exclusivos (convivencias, entrenamientos, charlas)',
      'Descuentos ampliados 10-15% en comercios, talleres y servicios aliados',
      'Acceso completo al sistema de puntos con múltiples formas de ganar',
      'Puntos adicionales por referir nuevos miembros',
      'Puntos por participación digital (foros, publicaciones, feedback)',
      'Gestión completa en plataforma web (eventos, historial, perfil con insignia Rider)',
      'Acceso a PQRSDF completo con prioridad media en respuestas',
      'Prioridad en cupos de eventos con aforo limitado frente a Friend',
      'Reconocimiento público como miembro Rider en comunidad y listados oficiales',
      'Compatibilidad con membresía Volunteer para acelerar ascenso a Pro'
    ],
    priority: 2,
  },
  Pro: {
    name: 'Pro',
    description: 'Miembro comprometido y activo - Verdadero colaborador del club',
    color: '#8B5CF6',
    icon: 'FaMedal',
    benefits: [
      'Todos los beneficios de Rider',
      'Acceso ampliado a beneficios de salud y seguros aliados (seguros moto, salud, asistencia carretera)',
      'Prioridad en inscripción a eventos con cupos limitados por encima de Friend y Rider',
      'Sistema de recompensas BSKMT con mejor tasa de acumulación de puntos',
      'Participación en entrenamientos y charlas exclusivas (conducción avanzada, mecánica, primeros auxilios)',
      'Beneficios ampliados en comercios aliados (15-20% en talleres, accesorios, indumentaria)',
      'Acceso a contenidos exclusivos en plataforma digital (formación, rutas, convenios privados)',
      'Reconocimiento público como miembro Pro con distintivo especial en listados y eventos',
      'Acceso a PQRSDF con prioridad alta',
      'Bonificación extra de puntos por referir nuevos miembros al club',
      'Acceso a eventos semi-privados organizados únicamente para Pro en adelante',
      'Compatibilidad con membresía Volunteer (clave para demostrar compromiso hacia Legend)'
    ],
    priority: 3,
  },
  Legend: {
    name: 'Legend',
    description: 'Leyenda con privilegios exclusivos',
    color: '#F59E0B',
    icon: 'FaCrown',
    benefits: [
      'Todos los beneficios de Pro',
      'Invitaciones a eventos VIP',
      'Descuentos en equipamiento premium',
      'Reconocimiento público especial',
      'Acceso a rutas exclusivas de leyendas',
    ],
    priority: 4,
  },
  Master: {
    name: 'Master',
    description: 'Maestro con máximos privilegios',
    color: '#EF4444',
    icon: 'FaGem',
    benefits: [
      'Todos los beneficios de Legend',
      'Membresía vitalicia BSK',
      'Derecho a voto en decisiones importantes',
      'Acceso completo a todas las instalaciones',
      'Programa de mentorías avanzado',
    ],
    priority: 5,
  },
  Volunteer: {
    name: 'Volunteer',
    description: 'Voluntario con reconocimiento especial',
    color: '#06B6D4',
    icon: 'FaHeart',
    benefits: [
      'Reconocimiento oficial como voluntario',
      'Certificaciones de servicio comunitario',
      'Puntos adicionales por actividades',
      'Acceso a capacitaciones exclusivas',
      'Beneficios especiales en eventos',
    ],
    priority: 6,
  },
  Leader: {
    name: 'Leader',
    description: 'Líder con responsabilidades y privilegios máximos',
    color: '#7C3AED',
    icon: 'FaUserTie',
    benefits: [
      'Todos los beneficios de Master y Volunteer',
      'Autoridad para organizar eventos oficiales',
      'Acceso completo al panel administrativo',
      'Derecho a representar al club oficialmente',
      'Compensación por actividades de liderazgo',
    ],
    priority: 7,
  },
};

// Jerarquía de membresías para cálculo de progreso
export const MEMBERSHIP_HIERARCHY: MembershipType[] = [
  'Friend',
  'Rider', 
  'Pro',
  'Legend',
  'Master'
  // Volunteer y Leader son roles especiales, no parte de la jerarquía lineal
];

// Puntos por diferentes actividades
export const POINTS_SYSTEM = {
  EVENT_ATTENDANCE: 100,
  EVENT_ORGANIZATION: 500,
  VOLUNTEERING: 200,
  PQRSDF_RESOLUTION: 50,
  MONTHLY_BONUS: 50, // Por cada mes activo
  REFERRAL_BONUS: 300, // Por referir un nuevo miembro
  SOCIAL_ENGAGEMENT: 25, // Por participación en foros, etc.
};

// Validaciones para solicitud de ascenso
export const canUpgradeToMembership = (
  currentType: MembershipType,
  targetType: MembershipType,
  userStats: {
    points: number;
    eventsAttended: number;
    volunteeringDone: number;
    daysInCurrentMembership: number;
    isVolunteer?: boolean;
  }
): { allowed: boolean; missingRequirements: string[] } => {
  const missingRequirements: string[] = [];
  
  // Verificar si es un ascenso válido en la jerarquía
  const currentIndex = MEMBERSHIP_HIERARCHY.indexOf(currentType);
  const targetIndex = MEMBERSHIP_HIERARCHY.indexOf(targetType);
  
  if (targetIndex <= currentIndex && targetType !== 'Leader') {
    return { allowed: false, missingRequirements: ['No puedes descender o mantener el mismo nivel'] };
  }
  
  // Casos especiales: Leader requiere ser Master y Volunteer
  if (targetType === 'Leader') {
    if (currentType !== 'Master') {
      missingRequirements.push('Debes ser Master para aplicar a Leader');
    }
    if (!userStats.isVolunteer) {
      missingRequirements.push('Debes ser Volunteer para aplicar a Leader');
    }
  }
  
  // Verificar requisitos del tipo objetivo
  const rules = MEMBERSHIP_RULES[targetType];
  
  if ('pointsRequired' in rules && userStats.points < rules.pointsRequired) {
    missingRequirements.push(`Necesitas ${rules.pointsRequired - userStats.points} puntos más`);
  }
  
  if ('eventsRequired' in rules && userStats.eventsAttended < rules.eventsRequired) {
    missingRequirements.push(`Necesitas asistir a ${rules.eventsRequired - userStats.eventsAttended} eventos más`);
  }
  
  if ('volunteeringRequired' in rules && userStats.volunteeringDone < rules.volunteeringRequired) {
    missingRequirements.push(`Necesitas completar ${rules.volunteeringRequired - userStats.volunteeringDone} voluntariados más`);
  }
  
  if ('timeRequired' in rules && userStats.daysInCurrentMembership < rules.timeRequired) {
    const daysNeeded = rules.timeRequired - userStats.daysInCurrentMembership;
    missingRequirements.push(`Necesitas ${daysNeeded} días más en tu membresía actual`);
  }
  
  return {
    allowed: missingRequirements.length === 0,
    missingRequirements
  };
};

// Calcular siguiente membresía en la jerarquía
export const getNextMembershipType = (currentType: MembershipType): MembershipType | undefined => {
  const currentIndex = MEMBERSHIP_HIERARCHY.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === MEMBERSHIP_HIERARCHY.length - 1) {
    return undefined; // Ya está en el máximo nivel o no está en la jerarquía
  }
  return MEMBERSHIP_HIERARCHY[currentIndex + 1];
};

// Calcular progreso hacia la siguiente membresía
export const calculateProgressToNext = (
  currentType: MembershipType,
  userStats: {
    points: number;
    eventsAttended: number;
    volunteeringDone: number;
    daysInCurrentMembership: number;
  }
): { percent: number; nextType: MembershipType | undefined } => {
  const nextType = getNextMembershipType(currentType);
  
  if (!nextType) {
    return { percent: 100, nextType: undefined };
  }
  
  const rules = MEMBERSHIP_RULES[nextType];
  const requirements = [];
  
  if ('pointsRequired' in rules) {
    requirements.push(Math.min(100, (userStats.points / rules.pointsRequired) * 100));
  }
  
  if ('eventsRequired' in rules) {
    requirements.push(Math.min(100, (userStats.eventsAttended / rules.eventsRequired) * 100));
  }
  
  if ('volunteeringRequired' in rules) {
    requirements.push(Math.min(100, (userStats.volunteeringDone / rules.volunteeringRequired) * 100));
  }
  
  if ('timeRequired' in rules) {
    requirements.push(Math.min(100, (userStats.daysInCurrentMembership / rules.timeRequired) * 100));
  }
  
  const percent = requirements.length > 0 
    ? Math.round(requirements.reduce((a, b) => a + b, 0) / requirements.length)
    : 100;
  
  return { percent, nextType };
};

// Funciones auxiliares para Friend → Rider
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const calculateMinimumDaysForUpgrade = (joinDate: Date): number => {
  const joinYear = joinDate.getFullYear();
  return isLeapYear(joinYear) ? 366 : 365;
};

export const calculateRequiredEventsForFriend = async (year: number): Promise<number> => {
  // TODO: Implementar lógica para obtener el total de eventos oficiales del año
  // Por ahora, estimamos basándose en un promedio
  const averageEventsPerYear = 24; // Estimación: 2 eventos por mes
  const eventPercentage = MEMBERSHIP_RULES.Friend.nextLevelRequirements?.eventPercentageRequired || 50;
  
  return Math.ceil((averageEventsPerYear * eventPercentage) / 100);
};

export const calculateFriendUpgradeRequirements = async (
  user: any, 
  userStats: any
): Promise<{
  pointsRequired: number;
  eventsRequired: number;
  volunteeringRequired: number;
  timeRequired: number;
  minimumDaysActual: number;
}> => {
  const friendRules = MEMBERSHIP_RULES.Friend.nextLevelRequirements;
  if (!friendRules) {
    throw new Error('Friend nextLevelRequirements not configured');
  }
  
  const joinDate = new Date(user.joinDate || user.createdAt);
  const minimumDaysActual = calculateMinimumDaysForUpgrade(joinDate);
  const currentYear = new Date().getFullYear();
  const eventsRequired = await calculateRequiredEventsForFriend(currentYear);
  
  return {
    pointsRequired: friendRules.pointsRequired,
    eventsRequired,
    volunteeringRequired: friendRules.volunteeringRequired,
    timeRequired: minimumDaysActual,
    minimumDaysActual
  };
};

// Funciones auxiliares para Rider → Pro
export const calculateRiderUpgradeRequirements = async (
  user: any,
  userStats: any
): Promise<{
  pointsRequired: number;
  eventsRequired: number;
  volunteeringRequired: number;
  timeRequired: number;
  lastYearPointsRequired: number;
}> => {
  const riderRules = MEMBERSHIP_RULES.Rider;
  
  // Calcular eventos confirmados acumulados requeridos (50% del total histórico)
  const totalEventsHistorical = userStats.totalEventsAttended || userStats.eventsAttended;
  const eventsRequired = Math.ceil(totalEventsHistorical * 0.5); // 50% de eventos confirmados asistidos
  
  return {
    pointsRequired: 3000, // 3000 puntos totales acumulados
    eventsRequired, // 50% de eventos acumulados confirmados
    volunteeringRequired: 1, // Al menos 1 voluntariado operativo
    timeRequired: 730, // 2 años como Rider (730 días)
    lastYearPointsRequired: 1000 // 1000 puntos obtenidos el último año
  };
};

export const validateDigitalParticipation = async (user: any): Promise<boolean> => {
  // TODO: Implementar lógica real para validar participación digital activa
  // Por ahora, validamos basándose en actividad estimada
  
  const digitalActivity = user.digitalActivity || {
    forumPosts: 0,
    groupInteractions: 0,
    feedbackSent: 0,
    lastActivity: null
  };
  
  // Criterios mínimos para participación digital activa
  const minForumPosts = 5; // Al menos 5 posts en foros
  const minGroupInteractions = 10; // Al menos 10 interacciones en grupos
  const maxDaysSinceLastActivity = 30; // Actividad en los últimos 30 días
  
  const lastActivity = digitalActivity.lastActivity ? new Date(digitalActivity.lastActivity) : new Date(0);
  const daysSinceLastActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  return digitalActivity.forumPosts >= minForumPosts &&
         digitalActivity.groupInteractions >= minGroupInteractions &&
         daysSinceLastActivity <= maxDaysSinceLastActivity;
};

export const validateCleanRecord = async (user: any): Promise<boolean> => {
  // TODO: Implementar lógica real para validar historial limpio
  // Por ahora, validamos basándose en reportes disciplinarios
  
  const disciplinaryRecords = user.disciplinaryRecords || [];
  const ethicsViolations = user.ethicsViolations || [];
  
  // Sin reportes disciplinarios ni violaciones de ética
  return disciplinaryRecords.length === 0 && ethicsViolations.length === 0;
};

export const calculateLastYearPoints = (user: any, userStats: any): number => {
  // TODO: Implementar lógica real para calcular puntos del último año
  // Por ahora, estimamos basándose en actividad reciente
  
  const currentYear = new Date().getFullYear();
  const pointsHistory = user.pointsHistory || [];
  
  // Filtrar puntos del último año
  const lastYearPoints = pointsHistory
    .filter((entry: any) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    })
    .reduce((total: number, entry: any) => total + entry.points, 0);
  
  // Si no hay historial detallado, estimamos basándose en actividad reciente
  if (lastYearPoints === 0) {
    // Estimación conservadora: 30% de los puntos totales en el último año
    return Math.floor(userStats.points * 0.3);
  }
  
  return lastYearPoints;
};

// Funciones auxiliares para Pro → Legend
export const calculateProUpgradeRequirements = async (
  user: any,
  userStats: any
): Promise<{
  pointsRequired: number;
  eventsRequired: number;
  volunteeringRequired: number;
  timeRequired: number;
  lastYearPointsRequired: number;
  communityEventsRequired: number;
  educationalEventsRequired: number;
}> => {
  // Calcular eventos totales requeridos (50% del histórico general desde Friend)
  const totalEventsHistorical = userStats.totalEventsFromFriend || userStats.eventsAttended;
  const baseEventsRequired = Math.ceil(totalEventsHistorical * 0.5); // 50% de eventos generales
  
  // Calcular eventos específicos por tipo (20% cada uno del total base)
  const communityEventsRequired = Math.ceil(baseEventsRequired * 0.2); // 20% comunitarios
  const educationalEventsRequired = Math.ceil(baseEventsRequired * 0.2); // 20% educativos
  
  return {
    pointsRequired: 9000, // 9000 puntos totales (triple de Pro)
    eventsRequired: baseEventsRequired, // 50% eventos oficiales generales
    volunteeringRequired: 5, // Mínimo 5 participaciones
    timeRequired: 1095, // 3 años como Pro (1095 días)
    lastYearPointsRequired: 1000, // 1000 puntos del último año
    communityEventsRequired, // 20% eventos comunitarios/sociales/humanitarios
    educationalEventsRequired // 20% eventos educativos
  };
};

export const validateDemonstrableContribution = async (user: any): Promise<boolean> => {
  // TODO: Implementar lógica real para validar contribución demostrable
  // Por ahora, validamos basándose en participación en organización/apoyo
  
  const organizationActivities = user.organizationActivities || [];
  const supportActivities = user.supportActivities || [];
  const leadershipRoles = user.leadershipRoles || [];
  
  // Criterios mínimos para contribución demostrable
  const minOrganizationActivities = 2; // Al menos 2 actividades organizadas
  const minSupportActivities = 3; // Al menos 3 actividades de apoyo
  const hasLeadershipRole = leadershipRoles.length > 0; // Algún rol de liderazgo
  
  // Validar si ha participado en organización O apoyo significativo O liderazgo
  const hasOrganizationContribution = organizationActivities.length >= minOrganizationActivities;
  const hasSupportContribution = supportActivities.length >= minSupportActivities;
  
  return hasOrganizationContribution || hasSupportContribution || hasLeadershipRole;
};

export const calculateEventTypeDistribution = async (user: any): Promise<{
  totalEvents: number;
  communityEvents: number;
  educationalEvents: number;
  communityPercentage: number;
  educationalPercentage: number;
}> => {
  // TODO: Implementar lógica real para clasificar eventos por tipo
  // Por ahora, estimamos basándose en eventos registrados
  
  const allEvents = user.allEventsAttended || user.registeredEvents || [];
  const totalEvents = allEvents.length;
  
  // Clasificación estimada de eventos
  const communityEvents = allEvents.filter((event: any) => 
    event.type === 'community' || 
    event.type === 'social' || 
    event.type === 'humanitarian' ||
    event.category === 'comunitario'
  ).length;
  
  const educationalEvents = allEvents.filter((event: any) => 
    event.type === 'educational' || 
    event.type === 'training' || 
    event.category === 'educativo'
  ).length;
  
  // Si no hay clasificación específica, estimamos basándose en proporciones típicas
  const estimatedCommunityEvents = communityEvents || Math.floor(totalEvents * 0.25); // 25% estimado
  const estimatedEducationalEvents = educationalEvents || Math.floor(totalEvents * 0.25); // 25% estimado
  
  const communityPercentage = totalEvents > 0 ? (estimatedCommunityEvents / totalEvents) * 100 : 0;
  const educationalPercentage = totalEvents > 0 ? (estimatedEducationalEvents / totalEvents) * 100 : 0;
  
  return {
    totalEvents,
    communityEvents: estimatedCommunityEvents,
    educationalEvents: estimatedEducationalEvents,
    communityPercentage,
    educationalPercentage
  };
};

export const validateExemplaryAttitude = async (user: any): Promise<boolean> => {
  // TODO: Implementar lógica real para validar actitud ejemplar
  // Combina historial limpio + feedback positivo + comportamiento ejemplar
  
  const hasCleanRecord = await validateCleanRecord(user);
  const positiveFeedback = user.positiveFeedback || [];
  const exemplaryBehaviorReports = user.exemplaryBehaviorReports || [];
  const communityContributions = user.communityContributions || [];
  
  // Criterios para actitud ejemplar
  const minPositiveFeedback = 3; // Al menos 3 feedback positivos
  const minExemplaryReports = 1; // Al menos 1 reporte de comportamiento ejemplar
  const hasCommunityContributions = communityContributions.length > 0;
  
  return hasCleanRecord && 
         positiveFeedback.length >= minPositiveFeedback && 
         (exemplaryBehaviorReports.length >= minExemplaryReports || hasCommunityContributions);
};