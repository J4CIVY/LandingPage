import { MembershipType, MembershipRules, MembershipConfig, MembershipBenefits } from '@/types/membership';

// Reglas de negocio para cada tipo de membresía
export const MEMBERSHIP_RULES: MembershipRules = {
  Friend: {
    pointsRequired: 0,
    eventsRequired: 0,
    volunteeringRequired: 0,
    timeRequired: 0,
  },
  Rider: {
    pointsRequired: 1000,
    eventsRequired: 3,
    volunteeringRequired: 0,
    timeRequired: 30, // días como Friend
  },
  Pro: {
    pointsRequired: 5000,
    eventsRequired: 10,
    volunteeringRequired: 1,
    timeRequired: 90, // días como Rider
  },
  Legend: {
    pointsRequired: 15000,
    eventsRequired: 25,
    volunteeringRequired: 5,
    timeRequired: 180, // días como Pro
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
    description: 'Miembro inicial de la comunidad BSK',
    color: '#10B981', // green-500
    bgColor: '#ECFDF5', // green-50
    textColor: '#065F46', // green-800
    icon: 'FaUserFriends',
    badge: '🌟',
    gradient: 'from-green-400 to-green-600',
  },
  Rider: {
    name: 'Rider',
    description: 'Motociclista activo con experiencia comprobada',
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
    textColor: '#1E40AF', // blue-800
    icon: 'FaMotorcycle',
    badge: '🏍️',
    gradient: 'from-blue-400 to-blue-600',
  },
  Pro: {
    name: 'Pro',
    description: 'Miembro profesional con alta participación',
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
    description: 'Acceso básico a la comunidad',
    color: '#10B981',
    icon: 'FaUserFriends',
    benefits: [
      'Acceso a la comunidad BSK',
      'Participación en eventos públicos',
      'Newsletter mensual',
      'Acceso al foro comunitario',
    ],
    priority: 1,
  },
  Rider: {
    name: 'Rider',
    description: 'Miembro activo con beneficios extendidos',
    color: '#3B82F6',
    icon: 'FaMotorcycle',
    benefits: [
      'Todos los beneficios de Friend',
      'Descuentos en eventos exclusivos',
      'Acceso a rutas premium',
      'Kit de bienvenida BSK',
      'Soporte técnico básico',
    ],
    priority: 2,
  },
  Pro: {
    name: 'Pro',
    description: 'Profesional con acceso premium',
    color: '#8B5CF6',
    icon: 'FaMedal',
    benefits: [
      'Todos los beneficios de Rider',
      'Descuentos en talleres especializados',
      'Acceso prioritario a eventos',
      'Seguro de responsabilidad civil',
      'Mentorías con expertos',
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