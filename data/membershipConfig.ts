/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const */
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
    // Requisitos para obtener Master (desde Legend)
    pointsRequired: 18000, // 18000 puntos totales acumulados (doble de Legend)
    eventsRequired: 0, // Se calcula dinámicamente (50% eventos generales + tipos específicos)
    volunteeringRequired: 15, // Mínimo 15 participaciones en voluntariado
    timeRequired: 1460, // 4 años como Legend (1460 días)
    // Configuración específica Master
    specialRequirements: {
      lastYearPoints: 1000, // 1000 puntos obtenidos el último año
      confirmedEventsOnly: true, // Solo eventos confirmados asistidos
      eventTypeDistribution: {
        communityEvents: 20, // 20% eventos comunitarios/sociales/humanitarios
        educationalEvents: 20, // 20% eventos educativos
        organizedEvents: 10 // 10% eventos organizados directamente por el miembro
      },
      outstandingProjectParticipation: true, // Proyectos comunitarios destacados
      officialRecognition: true, // Reconocimiento oficial del club
      fromMembershipType: 'Legend' // Solo desde Legend
    }
  },
  Leader: {
    // Requisitos para obtener Leader (desde Master) - Membresía de liderazgo/cargo
    pointsRequired: 30000, // 30000 puntos totales acumulados (requisito mínimo)
    eventsRequired: 0, // Se calcula dinámicamente (80% eventos oficiales + liderazgo demostrado)
    volunteeringRequired: 30, // Mínimo 30 participaciones en roles de alto impacto
    timeRequired: 1825, // 5 años como Master (1825 días)
    // Configuración específica Leader
    specialRequirements: {
      // Requisitos básicos obligatorios
      mustBeMaster: true, // Obligatorio ser Master
      mustBeActiveVolunteer: true, // Obligatorio estar activo como Volunteer
      pointsMinimum: 40000, // Puntos mínimos al momento de postulación
      
      // Historial de eventos
      eventAttendanceRate: 80, // 80% asistencia a eventos oficiales en total
      leadershipEventsRequired: 10, // Porcentaje de eventos donde demostró liderazgo/coorganización (≥10% del total)
      leadershipEventsSuccessRate: 100, // Resultado positivo en eventos liderados
      
      // Voluntariado alto impacto
      highImpactVolunteering: true, // Requiere voluntariado en roles de alto impacto
      highImpactVolunteeringRequired: 30, // 30 participaciones en roles de alto impacto
      highImpactRoles: [
        'coordinacion_logistica',
        'jefe_seguridad', 
        'responsable_comunicaciones',
        'coordinacion_ruta',
        'relaciones_aliados'
      ],
      
      // Historial disciplinario
      cleanDisciplinaryRecord: true, // Expediente limpio (sin sanciones relevantes)
      noSuspensions: true, // Sin suspensiones
      noGraveWarnings: true, // Sin amonestaciones graves
      noRuleViolations: true, // Sin incumplimientos de normas
      
      // Proceso de postulación formal
      formalApplication: {
        leadershipPlanRequired: true, // Plan de Liderazgo (visión, prioridades, proyecto 12 meses)
        applicationFormRequired: true, // Formulario de postulación
        endorsements: {
          activeLeadersRequired: 3, // Mínimo 3 Leaders activos
          activeMastersRequired: 5 // Mínimo 5 Masters activos
        }
      },
      
      // Proceso de evaluación
      evaluationProcess: {
        evaluationCommittee: true, // Revisión por Comisión Evaluadora
        publicInterview: true, // Entrevista/presentación pública
        consultativeVoting: true, // Votación consultiva (50%+1 miembros activos)
        presidentialRatification: true, // Ratificación final presidencia
        boardConfirmation: true // Confirmación Directiva del club
      },
      
      // Disponibilidad operativa
      minimumAvailability: {
        hoursPerMonth: 8, // 8-12 horas/mes mínimo
        maxHoursPerMonth: 12,
        meetingsRequired: true, // Disponibilidad para reuniones
        coordinationRequired: true, // Coordinación operativa
        eventPresenceRequired: true // Presencia en eventos oficiales
      },
      
      // Condiciones especiales
      mandateDuration: 12, // 12 meses (renovable)
      renewable: true, // Renovable mediante evaluación
      vacancyRequired: true, // Debe existir vacante en roles administrativos
      exemplaryConduct: true, // Conducta ejemplar obligatoria
      
      fromMembershipType: 'Master' as MembershipType // Solo desde Master
    }
  },
  Volunteer: {
    // Membresía complementaria especial (no competitiva)
    canAttachTo: ['Friend', 'Rider', 'Pro', 'Legend', 'Master', 'Leader'],
    requirements: {
      // Requisitos específicos para Volunteer
      activeCommitment: true, // Disposición para participar activamente
      clubValuesAlignment: true, // Compromiso con valores del club
      minimumContribution: 2, // Mínimo 2 actividades voluntarias por mes
      flexibleDuration: true // Duración flexible según proyectos
    },
    additionalBenefits: [
      'Acceso exclusivo a actividades internas y logística',
      'Reconocimiento oficial como voluntario BSKMT',
      'Capacitaciones especializadas (eventos, seguridad vial, gestión)',
      'Certificados de participación y experiencia',
      'Prioridad para postulaciones a otras membresías',
      'Red de contactos con pilotos, organizadores y patrocinadores',
      'Acceso parcial a beneficios de patrocinadores',
      'Puntos adicionales por actividades voluntarias'
    ],
    specialFeatures: {
      isComplementary: true, // Se adjunta a membresía principal
      doesNotCompete: true, // No compite con otras membresías
      flexibleCommitment: true, // Compromiso flexible por proyectos
      enhancesProgression: true // Mejora progresión en otras membresías
    }
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
    description: 'Referente del club - Modelo de conducta y liderazgo en BSKMT',
    color: '#F59E0B',
    icon: 'FaCrown',
    benefits: [
      'Todos los beneficios de Pro',
      'Reconocimiento oficial como referente del club con distintivo especial en plataforma, listados y eventos presenciales',
      'Acceso a beneficios premium de aliados (convenios especiales con marcas de motocicletas, equipamiento de alta gama, talleres selectos)',
      'Invitación a actividades VIP (rodadas exclusivas para Legend/Master, cenas de liderazgo, networking con aliados estratégicos)',
      'Participación en decisiones estratégicas del club como voz consultiva',
      'Acceso prioritario total en inscripciones a eventos con cupo limitado',
      'Mayor tasa de acumulación de puntos en el sistema de recompensas (multiplicador de 1.5x sobre acciones)',
      'Reconocimiento público en medios oficiales del club (redes sociales, página web, comunicados)',
      'Acceso exclusivo a formación avanzada (cursos especializados de conducción, seguridad vial, liderazgo comunitario)',
      'PQRSDF con máxima prioridad en atención y resolución',
      'Bonificación de puntos extra por mentoring a miembros de niveles inferiores (Rider, Pro)',
      'Representación oficial del club en espacios externos y eventos de industria',
      'Acceso a convenios de alto valor y exclusivos para Legend/Master',
      'Compatibilidad con membresía Volunteer (requisito constante para demostrar compromiso continuo)'
    ],
    priority: 4,
  },
  Master: {
    name: 'Master',
    description: 'Máxima figura de la corriente - Cúspide del compromiso y liderazgo en BSKMT',
    color: '#EF4444',
    icon: 'FaGem',
    benefits: [
      'Todos los beneficios de Legend',
      'Reconocimiento como figura máxima en la corriente de membresías (distintivo especial, mención en web y redes del club)',
      'Acceso a beneficios exclusivos de alto nivel con aliados estratégicos (descuentos especiales en marcas premium, convenios únicos)',
      'Prioridad absoluta en inscripción a todos los eventos, incluso frente a Legend',
      'Acceso ilimitado al sistema de recompensas, con multiplicador especial (2x en acumulación de puntos)',
      'Participación en espacios de toma de decisiones estratégicas con voz consultiva ampliada',
      'Acceso a experiencias exclusivas reservadas para Masters y Leaders (viajes especiales, encuentros privados con marcas aliadas, rodadas élite)',
      'Reconocimiento público constante en eventos y comunicaciones del club',
      'PQRSDF con atención preferencial total, siendo tratados como miembros de la más alta prioridad',
      'Mentoría oficial: derecho a guiar a Riders y Pros en su proceso de crecimiento',
      'Acceso a invitaciones especiales de entidades externas gracias a su condición de representante destacado de BSKMT',
      'Candidatura natural para membresía Leader tras 180 días mínimos como Master',
      'Representación oficial del club en eventos de industria y espacios de alto nivel',
      'Acceso a convenios y beneficios de élite exclusivos para Masters y Leaders'
    ],
    priority: 5,
  },
  Volunteer: {
    name: 'Volunteer',
    description: 'Membresía complementaria para apoyo activo - Enfocada en colaboración y voluntariado',
    color: '#06B6D4',
    icon: 'FaHeart',
    benefits: [
      'Membresía complementaria que se adjunta a tu membresía principal actual',
      'Acceso exclusivo a actividades internas como organización de eventos, logística y proyectos comunitarios',
      'Reconocimiento oficial como voluntario BSKMT, con acreditación en actividades y eventos',
      'Capacitaciones especializadas en organización de eventos, seguridad vial y gestión comunitaria',
      'Certificados de participación y experiencia que validan el apoyo prestado al club',
      'Prioridad para postularse a otras membresías del BSKMT en caso de querer avanzar en el futuro',
      'Red de contactos y comunidad, conectando con pilotos, organizadores y patrocinadores',
      'Acceso parcial a beneficios de patrocinadores (según acuerdos específicos con cada marca o aliado)',
      'Puntos adicionales en el sistema de recompensas por actividades voluntarias',
      'Acceso prioritario a capacitaciones exclusivas y formación especializada',
      'Reconocimiento especial en eventos y comunicaciones oficiales del club',
      'Oportunidades de networking con líderes del club y aliados estratégicos'
    ],
    priority: 6,
  },
  Leader: {
    name: 'Leader',
    description: 'Membresía de liderazgo/cargo - Responsabilidades formales de dirección, representación y toma de decisiones',
    color: '#7C3AED',
    icon: 'FaUserTie',
    benefits: [
      'Todos los beneficios de Master (membresía principal requerida)',
      'Voz y voto en decisiones estratégicas y asambleas donde se definan políticas del club (participación en mesa/directiva según estatutos)',
      'Capacidad formal de representación del club ante aliados, organismos y medios (autorización para firmar convenios menores)',
      'Representación oficial de BSKMT en eventos, con acuerdos mayores requiriendo co-firma de Directiva',
      'Acceso a canales exclusivos de comunicación (canal privado Leaders/Directiva, línea directa con sponsors)',
      'Acceso VIP en gestor de convenios y comunicación directa con patrocinadores estratégicos',
      'Poder de gestión operativa: proponer y aprobar equipos de voluntariado, crear comisiones, asignar responsabilidades',
      'Multiplicador de puntos especial: 2.5× sobre acciones que generen puntos (configurable por política)',
      'Prioridad total y acceso a convenios premium con aliados (condiciones reservadas para representantes oficiales)',
      'Asignación de recursos de apoyo para actividades oficiales (presupuesto operativo limitado, reimbursements por gestión aprobada)',
      'Formación y acompañamiento en liderazgo: acceso a capacitaciones y coaching ejecutivo patrocinados',
      'Visibilidad institucional y distintivos oficiales: placa, parche/chaleco oficial de Leader',
      'Mención permanente en web y comunicaciones oficiales del club como representante',
      'Derecho a proponer ascensos y candidatos (capacidad de nominar miembros para roles operativos)',
      'Propuestas consideradas con prioridad por la Comisión Evaluadora',
      'PQRSDF y atención administrativa con canal directo y prioridad absoluta',
      'Invitaciones y representación preferente en eventos oficiales, ruedas institucionales',
      'Reuniones exclusivas con aliados y patrocinadores estratégicos',
      'Autoridad para validar políticas de eventos y coordinar equipos operativos de alto nivel',
      'Acceso a información estratégica y participación en planificación a largo plazo del club'
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

export const calculateRequiredEventsForFriend = async (): Promise<number> => {
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
  const eventsRequired = await calculateRequiredEventsForFriend();
  
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

// =====================================
// FUNCIONES DE VALIDACIÓN LEGEND → MASTER
// =====================================

export const calculateLegendUpgradeRequirements = async (
  user: any, 
  userStats: any
) => {
  const totalEventsFromFriend = userStats.totalEventsFromFriend || userStats.eventsAttended;
  const eventsRequired = Math.max(Math.floor(totalEventsFromFriend * 0.5), 40); // 50% con mínimo 40
  
  // Cálculo de distribución de eventos para Master
  const communityEventsRequired = Math.max(Math.floor(eventsRequired * 0.2), 8); // 20% con mínimo 8
  const educationalEventsRequired = Math.max(Math.floor(eventsRequired * 0.2), 8); // 20% con mínimo 8
  const organizedEventsRequired = Math.max(Math.floor(eventsRequired * 0.1), 4); // 10% con mínimo 4
  
  return {
    pointsRequired: 18000, // Doble de Legend
    lastYearPointsRequired: 1000,
    eventsRequired,
    communityEventsRequired,
    educationalEventsRequired,
    organizedEventsRequired,
    volunteeringRequired: 15, // 15 voluntariados mínimo
    timeRequired: 1460 // 4 años como Legend
  };
};

export const validateOutstandingProjectParticipation = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de participación destacada en proyectos
  // Verifica: proyectos comunitarios, campañas sociales, actividades de impacto
  
  const communityProjects = user.communityProjects || [];
  const socialCampaigns = user.socialCampaigns || [];
  const impactActivities = user.impactActivities || [];
  const leadershipRoles = user.leadershipRoles || [];
  const projectContributions = user.projectContributions || [];
  
  // Para ser Master se requiere participación destacada
  const hasSignificantProjects = communityProjects.length >= 2;
  const hasImpactParticipation = socialCampaigns.length >= 1 || impactActivities.length >= 2;
  const hasLeadershipExperience = leadershipRoles.length >= 1;
  const hasDocumentedContributions = projectContributions.length >= 3;
  
  return hasSignificantProjects && 
         hasImpactParticipation && 
         (hasLeadershipExperience || hasDocumentedContributions);
};

export const validateOfficialRecognition = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de reconocimiento oficial del club
  // Verifica: reconocimientos formales, certificaciones, menciones oficiales
  
  const officialRecognitions = user.officialRecognitions || [];
  const clubCertifications = user.clubCertifications || [];
  const publicMentions = user.publicMentions || [];
  const leadershipEndorsements = user.leadershipEndorsements || [];
  const outstandingAchievements = user.outstandingAchievements || [];
  
  // Para Master se requiere reconocimiento oficial del club
  const hasOfficialRecognition = officialRecognitions.length >= 1;
  const hasClubCertification = clubCertifications.length >= 1;
  const hasPublicRecognition = publicMentions.length >= 2;
  const hasLeadershipEndorsement = leadershipEndorsements.length >= 2;
  const hasOutstandingAchievement = outstandingAchievements.length >= 1;
  
  // Al menos 2 de estos criterios deben cumplirse
  const criteriaCount = [
    hasOfficialRecognition,
    hasClubCertification,
    hasPublicRecognition,
    hasLeadershipEndorsement,
    hasOutstandingAchievement
  ].filter(Boolean).length;
  
  return criteriaCount >= 2;
};

export const calculateOrganizedEventsDistribution = async (user: any) => {
  // TODO: Implementar cálculo de eventos organizados por el miembro
  // Clasifica eventos donde el miembro fue organizador principal o co-organizador
  
  const organizedEvents = user.organizedEvents || [];
  const coOrganizedEvents = user.coOrganizedEvents || [];
  const supportedEvents = user.supportedEvents || [];
  const allEvents = user.allEvents || [];
  
  const totalOrganizedEvents = organizedEvents.length + Math.floor(coOrganizedEvents.length * 0.5);
  const totalEventsFromFriend = user.totalEventsFromFriend || allEvents.length;
  
  const organizedPercentage = totalEventsFromFriend > 0 ? 
    (totalOrganizedEvents / totalEventsFromFriend) * 100 : 0;
  
  return {
    totalOrganizedEvents,
    organizedEvents: organizedEvents.length,
    coOrganizedEvents: coOrganizedEvents.length,
    supportedEvents: supportedEvents.length,
    organizedPercentage,
    meetsRequirement: organizedPercentage >= 10 // 10% mínimo para Master
  };
};

// =====================================
// FUNCIONES DE VALIDACIÓN MASTER → LEADER
// =====================================

export const calculateMasterUpgradeRequirements = async (
  user: any, 
  userStats: any
) => {
  const totalEventsFromFriend = userStats.totalEventsFromFriend || userStats.eventsAttended;
  const eventsRequired = Math.max(Math.floor(totalEventsFromFriend * 0.8), 60); // 80% con mínimo 60
  
  // Cálculo de distribución de eventos para Leader
  const communityEventsRequired = Math.max(Math.floor(eventsRequired * 0.3), 18); // 30% con mínimo 18
  const educationalEventsRequired = Math.max(Math.floor(eventsRequired * 0.3), 18); // 30% con mínimo 18
  const organizedEventsRequired = Math.max(Math.floor(eventsRequired * 0.2), 12); // 20% con mínimo 12
  
  return {
    pointsRequired: 40000, // Doble de Master
    lastYearPointsRequired: 1000,
    eventsRequired,
    communityEventsRequired,
    educationalEventsRequired,
    organizedEventsRequired,
    volunteeringRequired: 30, // 30 voluntariados de alto impacto
    timeRequired: 1825, // 5 años como Master
    highParticipationRequired: 80 // 80% vs 50% normal
  };
};

export const validateCommunityRecognition = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de reconocimiento comunitario
  // Verifica: apoyo y confianza de la mayoría de la comunidad activa
  
  const communityEndorsements = user.communityEndorsements || [];
  const peerRecommendations = user.peerRecommendations || [];
  const publicSupport = user.publicSupport || [];
  const communityVotes = user.communityVotes || [];
  const socialRecognition = user.socialRecognition || [];
  
  // Para ser Leader se requiere reconocimiento amplio de la comunidad
  const hasStrongEndorsements = communityEndorsements.length >= 10; // 10+ endorsements
  const hasPeerSupport = peerRecommendations.length >= 15; // 15+ recomendaciones de pares
  const hasPublicRecognition = publicSupport.length >= 5; // 5+ menciones públicas positivas
  const hasCommunitySupport = communityVotes.filter((vote: any) => vote.positive).length >= 20; // 20+ votos positivos
  const hasSocialValidation = socialRecognition.length >= 8; // 8+ reconocimientos sociales
  
  // Al menos 3 de estos 5 criterios deben cumplirse para demostrar reconocimiento mayoritario
  const criteriaCount = [
    hasStrongEndorsements,
    hasPeerSupport,
    hasPublicRecognition,
    hasCommunitySupport,
    hasSocialValidation
  ].filter(Boolean).length;
  
  return criteriaCount >= 3;
};

export const validateDirectiveValidation = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación formal de la directiva
  // Verifica: validación formal de la directiva para el salto a Leader
  
  const directiveApprovals = user.directiveApprovals || [];
  const formalRecommendations = user.formalRecommendations || [];
  const leadershipAssessments = user.leadershipAssessments || [];
  const boardEndorsements = user.boardEndorsements || [];
  const officialValidations = user.officialValidations || [];
  
  // Para ser Leader se requiere validación formal de la directiva
  const hasDirectiveApproval = directiveApprovals.length >= 1; // Al menos 1 aprobación directiva
  const hasFormalRecommendation = formalRecommendations.length >= 2; // 2+ recomendaciones formales
  const hasLeadershipAssessment = leadershipAssessments.filter((a: any) => a.result === 'approved').length >= 1;
  const hasBoardEndorsement = boardEndorsements.length >= 1; // Endorsement del consejo
  const hasOfficialValidation = officialValidations.filter((v: any) => v.status === 'approved').length >= 1;
  
  // Se requieren al menos la aprobación directiva + 2 criterios adicionales
  return hasDirectiveApproval && 
         [hasFormalRecommendation, hasLeadershipAssessment, hasBoardEndorsement, hasOfficialValidation]
         .filter(Boolean).length >= 2;
};

export const validateHighImpactVolunteering = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de voluntariado de alto impacto
  // Verifica: voluntariado en roles de alto impacto organizativo
  
  const highImpactVolunteering = user.highImpactVolunteering || [];
  const organizationRoles = user.organizationRoles || [];
  const coordinationExperience = user.coordinationExperience || [];
  const representationRoles = user.representationRoles || [];
  const projectLeadership = user.projectLeadership || [];
  
  // Para ser Leader se requiere demostrar voluntariado de alto impacto
  const hasHighImpactRoles = highImpactVolunteering.length >= 15; // 15+ roles de alto impacto
  const hasOrganizationExperience = organizationRoles.length >= 5; // 5+ roles organizativos
  const hasCoordinationSkills = coordinationExperience.length >= 8; // 8+ experiencias de coordinación
  const hasRepresentationExperience = representationRoles.length >= 3; // 3+ roles de representación
  const hasProjectLeadership = projectLeadership.length >= 4; // 4+ proyectos liderados
  
  // Al menos 3 de estos criterios + el requisito base de 15 roles de alto impacto
  const additionalCriteria = [
    hasOrganizationExperience,
    hasCoordinationSkills,
    hasRepresentationExperience,
    hasProjectLeadership
  ].filter(Boolean).length;
  
  return hasHighImpactRoles && additionalCriteria >= 3;
};

export const calculateHighParticipationEvents = async (user: any) => {
  // TODO: Implementar cálculo de eventos con alta participación
  // Verifica que el miembro haya asistido al 80% de eventos vs 50% normal
  
  const allEventsFromFriend = user.allEventsFromFriend || [];
  const attendedEvents = user.attendedEvents || [];
  
  const totalEventsAvailable = allEventsFromFriend.length;
  const totalEventsAttended = attendedEvents.length;
  const participationRate = totalEventsAvailable > 0 ? 
    (totalEventsAttended / totalEventsAvailable) * 100 : 0;
  
  const requiredParticipationRate = 80; // 80% para Leader vs 50% normal
  const meetsHighParticipation = participationRate >= requiredParticipationRate;
  
  return {
    totalEventsAvailable,
    totalEventsAttended,
    participationRate,
    requiredParticipationRate,
    meetsHighParticipation,
    eventsShortfall: meetsHighParticipation ? 0 : 
      Math.ceil((requiredParticipationRate / 100 * totalEventsAvailable) - totalEventsAttended)
  };
};

// =====================================
// FUNCIONES DE VALIDACIÓN VOLUNTEER
// =====================================

export const validateVolunteerCommitment = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de compromiso voluntario
  // Verifica: disposición para participar activamente en actividades BSKMT
  
  const volunteerActivities = user.volunteerActivities || [];
  const monthlyContributions = user.monthlyContributions || [];
  const eventParticipation = user.eventParticipation || [];
  const logisticsSupport = user.logisticsSupport || [];
  const projectInvolvement = user.projectInvolvement || [];
  
  // Para Volunteer se requiere compromiso activo demostrable
  const hasActiveParticipation = volunteerActivities.length >= 2; // 2+ actividades mensuales
  const hasConsistentContribution = monthlyContributions.length >= 3; // 3+ meses consecutivos
  const hasEventSupport = eventParticipation.length >= 1; // Al menos 1 evento apoyado
  const hasLogisticsExperience = logisticsSupport.length >= 1; // Experiencia en logística
  const hasProjectInvolvement = projectInvolvement.length >= 1; // Participación en proyectos
  
  // Se requieren al menos 3 de estos 5 criterios para demostrar compromiso activo
  const criteriaCount = [
    hasActiveParticipation,
    hasConsistentContribution,
    hasEventSupport,
    hasLogisticsExperience,
    hasProjectInvolvement
  ].filter(Boolean).length;
  
  return criteriaCount >= 3;
};

export const validateClubValues = async (user: any): Promise<boolean> => {
  // TODO: Implementar validación de alineación con valores del club
  // Verifica: compromiso con respeto, seguridad, compañerismo y pasión por motociclismo
  
  const respectDemonstration = user.respectDemonstration || [];
  const safetyCommitment = user.safetyCommitment || [];
  const fellowshipActivities = user.fellowshipActivities || [];
  const motorcyclePassion = user.motorcyclePassion || [];
  const clubRepresentation = user.clubRepresentation || [];
  const positiveReferences = user.positiveReferences || [];
  
  // Para Volunteer se requiere demostrar alineación con valores BSKMT
  const demonstratesRespect = respectDemonstration.length >= 2; // 2+ demostraciones de respeto
  const prioritizesSafety = safetyCommitment.length >= 2; // 2+ compromisos de seguridad
  const fostersFellowship = fellowshipActivities.length >= 2; // 2+ actividades de compañerismo
  const showsPassion = motorcyclePassion.length >= 1; // Pasión por motociclismo demostrada
  const representsWell = clubRepresentation.length >= 1; // Representa bien al club
  const hasPositiveReferences = positiveReferences.length >= 3; // 3+ referencias positivas
  
  // Se requieren al menos 4 de estos 6 criterios para validar alineación con valores
  const criteriaCount = [
    demonstratesRespect,
    prioritizesSafety,
    fostersFellowship,
    showsPassion,
    representsWell,
    hasPositiveReferences
  ].filter(Boolean).length;
  
  return criteriaCount >= 4;
};

export const calculateVolunteerContributions = async (user: any) => {
  // TODO: Implementar cálculo de contribuciones voluntarias
  // Calcula y clasifica las contribuciones del volunteer por tipo y impacto
  
  const eventOrganization = user.eventOrganization || [];
  const logisticsSupport = user.logisticsSupport || [];
  const communityProjects = user.communityProjects || [];
  const safetyPrograms = user.safetyPrograms || [];
  const socialCampaigns = user.socialCampaigns || [];
  const mentorshipActivities = user.mentorshipActivities || [];
  
  const totalContributions = eventOrganization.length + logisticsSupport.length + 
                           communityProjects.length + safetyPrograms.length + 
                           socialCampaigns.length + mentorshipActivities.length;
  
  const monthlyAverage = totalContributions > 0 ? totalContributions / 6 : 0; // Promedio últimos 6 meses
  const meetsMinimumContribution = monthlyAverage >= 2; // 2+ actividades mensuales
  
  // Clasificación por impacto
  const highImpactActivities = eventOrganization.length + communityProjects.length;
  const mediumImpactActivities = logisticsSupport.length + safetyPrograms.length;
  const lowImpactActivities = socialCampaigns.length + mentorshipActivities.length;
  
  return {
    totalContributions,
    monthlyAverage,
    meetsMinimumContribution,
    breakdown: {
      eventOrganization: eventOrganization.length,
      logisticsSupport: logisticsSupport.length,
      communityProjects: communityProjects.length,
      safetyPrograms: safetyPrograms.length,
      socialCampaigns: socialCampaigns.length,
      mentorshipActivities: mentorshipActivities.length
    },
    impactClassification: {
      highImpact: highImpactActivities,
      mediumImpact: mediumImpactActivities,
      lowImpact: lowImpactActivities
    }
  };
};

export const getVolunteerBenefitsEligibility = async (user: any, mainMembershipType: MembershipType) => {
  // TODO: Implementar cálculo de elegibilidad para beneficios Volunteer
  // Determina qué beneficios específicos obtiene según membresía principal y contribuciones
  
  const volunteerContributions = await calculateVolunteerContributions(user);
  const hasCommitment = await validateVolunteerCommitment(user);
  const hasValuesAlignment = await validateClubValues(user);
  
  const baseBenefits = [
    'Acceso a actividades internas',
    'Reconocimiento oficial como voluntario',
    'Certificados de participación'
  ];
  
  const enhancedBenefits = [
    'Capacitaciones especializadas',
    'Prioridad en postulaciones',
    'Red de contactos ampliada'
  ];
  
  const premiumBenefits = [
    'Acceso a beneficios de patrocinadores',
    'Networking con líderes',
    'Oportunidades de representación'
  ];
  
  let eligibleBenefits = [...baseBenefits];
  
  // Beneficios adicionales según nivel de contribución
  if (volunteerContributions.meetsMinimumContribution && hasCommitment) {
    eligibleBenefits.push(...enhancedBenefits);
  }
  
  // Beneficios premium para niveles altos o alta contribución
  if ((mainMembershipType === 'Pro' || mainMembershipType === 'Legend' || 
       mainMembershipType === 'Master' || mainMembershipType === 'Leader') &&
      hasValuesAlignment && volunteerContributions.monthlyAverage >= 3) {
    eligibleBenefits.push(...premiumBenefits);
  }
  
  return {
    eligibleBenefits,
    contributionLevel: (volunteerContributions.monthlyAverage >= 3 ? 'high' : 
                       volunteerContributions.monthlyAverage >= 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    hasFullAccess: hasCommitment && hasValuesAlignment,
    mainMembershipBonus: ['Pro', 'Legend', 'Master', 'Leader'].includes(mainMembershipType)
  };
};

// ========================================
// FUNCIONES DE VALIDACIÓN PARA LEADER
// ========================================

export const validateLeaderRequirements = async (user: any) => {
  // Valida requisitos básicos para postulación como Leader
  
  const isMaster = user.membershipType === 'Master';
  const isActiveVolunteer = user.volunteer === true;
  const hasMinimumPoints = (user.points || 0) >= 40000;
  
  const masterStartDate = user.masterStartDate || user.joinDate;
  const yearsAsMaster = masterStartDate ? 
    (Date.now() - new Date(masterStartDate).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
  const hasRequiredMasterTime = yearsAsMaster >= 5;
  
  return {
    isMaster,
    isActiveVolunteer,
    hasMinimumPoints,
    hasRequiredMasterTime,
    yearsAsMaster: Math.round(yearsAsMaster * 10) / 10,
    allBasicRequirementsMet: isMaster && isActiveVolunteer && hasMinimumPoints && hasRequiredMasterTime
  };
};

export const validateLeadershipHistory = async (user: any) => {
  // Valida historial de liderazgo en eventos
  
  const eventsAttended = user.eventsAttended || [];
  const totalOfficialEvents = user.totalOfficialEvents || 100; // TODO: Obtener de BD
  const attendanceRate = totalOfficialEvents > 0 ? (eventsAttended.length / totalOfficialEvents) * 100 : 0;
  
  // Eventos donde demostró liderazgo (coorganización, coordinación)
  const leadershipEvents = user.leadershipEvents || [];
  const leadershipEventsRate = totalOfficialEvents > 0 ? (leadershipEvents.length / totalOfficialEvents) * 100 : 0;
  
  // Evaluar éxito en eventos liderados
  const successfulLeadershipEvents = leadershipEvents.filter((event: any) => event.success === true);
  const leadershipSuccessRate = leadershipEvents.length > 0 ? 
    (successfulLeadershipEvents.length / leadershipEvents.length) * 100 : 0;
  
  return {
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    meetsAttendanceRequirement: attendanceRate >= 80,
    leadershipEventsRate: Math.round(leadershipEventsRate * 10) / 10,
    meetsLeadershipRequirement: leadershipEventsRate >= 10,
    leadershipSuccessRate: Math.round(leadershipSuccessRate * 10) / 10,
    hasSuccessfulLeadership: leadershipSuccessRate >= 100,
    totalEventsAttended: eventsAttended.length,
    totalLeadershipEvents: leadershipEvents.length,
    successfulLeadershipEventsCount: successfulLeadershipEvents.length
  };
};

export const validateDisciplinaryRecord = async (user: any) => {
  // Valida historial disciplinario limpio
  
  const suspensions = user.suspensions || [];
  const graveWarnings = user.graveWarnings || [];
  const ruleViolations = user.ruleViolations || [];
  const activeSanctions = user.activeSanctions || [];
  
  const hasSuspensions = suspensions.length > 0;
  const hasGraveWarnings = graveWarnings.length > 0;
  const hasRuleViolations = ruleViolations.length > 0;
  const hasActiveSanctions = activeSanctions.length > 0;
  
  const cleanRecord = !hasSuspensions && !hasGraveWarnings && !hasRuleViolations && !hasActiveSanctions;
  
  return {
    cleanRecord,
    hasSuspensions,
    hasGraveWarnings, 
    hasRuleViolations,
    hasActiveSanctions,
    suspensionsCount: suspensions.length,
    graveWarningsCount: graveWarnings.length,
    ruleViolationsCount: ruleViolations.length,
    activeSanctionsCount: activeSanctions.length
  };
};

export const validateLeaderHighImpactVolunteering = async (user: any) => {
  // Valida participación en voluntariado de alto impacto
  
  const highImpactRoles = [
    'coordinacion_logistica',
    'jefe_seguridad',
    'responsable_comunicaciones', 
    'coordinacion_ruta',
    'relaciones_aliados'
  ];
  
  const volunteerActivities = user.volunteerActivities || [];
  const highImpactActivities = volunteerActivities.filter((activity: any) => 
    highImpactRoles.includes(activity.role)
  );
  
  const meetsHighImpactRequirement = highImpactActivities.length >= 30;
  
  // Clasificar por tipo de rol
  const roleDistribution: Record<string, number> = {};
  highImpactRoles.forEach(role => {
    roleDistribution[role] = highImpactActivities.filter((a: any) => a.role === role).length;
  });
  
  return {
    totalHighImpactActivities: highImpactActivities.length,
    meetsHighImpactRequirement,
    roleDistribution,
    hasVarietyInRoles: Object.values(roleDistribution).filter(count => count > 0).length >= 3,
    averageImpactRating: highImpactActivities.length > 0 ? 
      highImpactActivities.reduce((acc: number, act: any) => acc + (act.impactRating || 5), 0) / highImpactActivities.length : 0
  };
};

export const calculateLeadershipEligibility = async (user: any) => {
  // Calcula elegibilidad completa para Leader considerando todos los requisitos
  
  const basicRequirements = await validateLeaderRequirements(user);
  const leadershipHistory = await validateLeadershipHistory(user);
  const disciplinaryRecord = await validateDisciplinaryRecord(user);
  const highImpactVolunteering = await validateLeaderHighImpactVolunteering(user);
  
  // Verificar si existe vacante disponible (TODO: implementar lógica real)
  const vacancyAvailable = true; // Placeholder
  
  const allRequirementsMet = 
    basicRequirements.allBasicRequirementsMet &&
    leadershipHistory.meetsAttendanceRequirement &&
    leadershipHistory.meetsLeadershipRequirement &&
    leadershipHistory.hasSuccessfulLeadership &&
    disciplinaryRecord.cleanRecord &&
    highImpactVolunteering.meetsHighImpactRequirement &&
    vacancyAvailable;
  
  return {
    isEligible: allRequirementsMet,
    basicRequirements,
    leadershipHistory,
    disciplinaryRecord,
    highImpactVolunteering,
    vacancyAvailable,
    completionPercentage: Math.round(([
      basicRequirements.allBasicRequirementsMet,
      leadershipHistory.meetsAttendanceRequirement,
      leadershipHistory.meetsLeadershipRequirement,
      leadershipHistory.hasSuccessfulLeadership,
      disciplinaryRecord.cleanRecord,
      highImpactVolunteering.meetsHighImpactRequirement
    ].filter(Boolean).length / 6) * 100)
  };
};