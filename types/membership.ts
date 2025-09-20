// Types para el nuevo sistema de membresías con 7 tipos diferentes
export type MembershipType = 'Friend' | 'Rider' | 'Pro' | 'Legend' | 'Master' | 'Volunteer' | 'Leader';

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface RequirementStatus {
  id: string;
  label: string;
  fulfilled: boolean;
  progress: number; // 0-100
  detail?: string;
  relatedEventId?: string;
}

export interface MembershipHistoryEntry {
  date: string;
  action: string;
  by?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
  points: number;
  requirements?: string[];
}

export interface MembershipProgress {
  nextType?: MembershipType;
  percent: number;
  requirements: RequirementStatus[];
}

export interface Membership {
  type: MembershipType;
  startDate: string;
  expiryDate?: string | null;
  status: MembershipStatus;
  points: number;
  benefits: string[];
  progress: MembershipProgress;
  history: MembershipHistoryEntry[];
  volunteer?: boolean;
  leaderApplication?: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    appliedAt?: string;
    note?: string;
  };
}

export interface UserRanking {
  position: number;
  totalMembers: number;
  points: number;
}

export interface MembershipResponse {
  userId: string;
  membership: Membership;
  ranking: UserRanking;
  achievements: Achievement[];
}

// Request/Response types para los endpoints
export interface RenewMembershipRequest {
  userId?: string; // Opcional, se puede usar el token
}

export interface CancelMembershipRequest {
  reason?: string;
}

export interface RequestUpgradeRequest {
  from: MembershipType;
  to: MembershipType;
}

export interface RequestUpgradeResponse {
  allowed: boolean;
  missingRequirements: RequirementStatus[];
}

export interface VolunteerToggleRequest {
  enable: boolean;
}

export interface ApplyLeaderRequest {
  applicationText: string;
  attachments?: string[];
}

export interface MembershipRequirement {
  id: string;
  label: string;
  description: string;
  pointsRequired?: number;
  eventsRequired?: number;
  volunteeringRequired?: number;
  membershipType: MembershipType;
  category: 'events' | 'points' | 'volunteering' | 'time' | 'other';
}

export interface LeaderboardMember {
  userId: string;
  name: string;
  points: number;
  membershipType: MembershipType;
  position: number;
  avatar?: string;
}

export interface LeaderboardResponse {
  members: LeaderboardMember[];
  userPosition?: number;
}

// Reglas de negocio para requisitos de cada membresía
export interface FriendRequirements {
  pointsRequired: 0;
  eventsRequired: 0;
  volunteeringRequired: 0;
  timeRequired: 0; // días
  // Configuración especial para Friend → Rider
  nextLevelRequirements?: {
    pointsRequired: number;
    eventsRequired: number; // Se calcula dinámicamente
    volunteeringRequired: number;
    timeRequired: number; // 365 días normales, 366 bisiesto
    minimumDaysForUpgrade: number;
    leapYearDays: number;
    eventPercentageRequired: number; // % de eventos del año
  };
}

export interface StandardMembershipRequirements {
  pointsRequired: number;
  eventsRequired: number;
  volunteeringRequired: number;
  timeRequired: number; // días en nivel anterior
}

export interface RiderRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
    confirmedEventsOnly: boolean; // Solo eventos con asistencia confirmada
    cleanRecord: boolean; // Historial limpio obligatorio
    fromMembershipType: MembershipType; // Desde qué membresía puede acceder
  };
}

export interface ProRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
    lastYearPoints: number; // Puntos obtenidos el último año
    confirmedEventsOnly: boolean; // Solo eventos confirmados asistidos
    digitalParticipation: boolean; // Participación digital activa
    cleanRecord: boolean; // Sin faltas disciplinarias
    fromMembershipType: MembershipType; // Desde qué membresía puede acceder
  };
}

export interface LegendRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
    lastYearPoints: number; // Puntos obtenidos el último año
    confirmedEventsOnly: boolean; // Solo eventos confirmados asistidos
    eventTypeDistribution: {
      communityEvents: number; // % eventos comunitarios/sociales/humanitarios
      educationalEvents: number; // % eventos educativos
    };
    demonstrableContribution: boolean; // Participación en organización/apoyo
    cleanRecord: boolean; // Historial limpio y actitud ejemplar
    fromMembershipType: MembershipType; // Desde qué membresía puede acceder
  };
}

export interface MembershipRules {
  Friend: FriendRequirements;
  Rider: RiderRequirements;
  Pro: ProRequirements;
  Legend: LegendRequirements;
  Master: StandardMembershipRequirements;
  Volunteer: {
    // Se puede agregar a cualquier tipo
    canAttachTo: MembershipType[];
    additionalBenefits: string[];
  };
  Leader: StandardMembershipRequirements & {
    mustBeVolunteer: true;
    mustBeMaster: true;
    requiresApplication: true;
  };
}

// Beneficios por tipo de membresía
export type MembershipBenefits = {
  [key in MembershipType]: {
    name: string;
    description: string;
    color: string;
    icon: string;
    benefits: string[];
    priority: number;
  };
};

// Configuración visual para cada tipo de membresía
export type MembershipConfig = {
  [key in MembershipType]: {
    name: string;
    description: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
    badge?: string;
    gradient?: string;
  };
};

// Tipos para manejo de errores en API
export interface ApiError {
  message: string;
  code: number;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Eventos del sistema para tracking
export interface MembershipEvent {
  type: 'upgrade' | 'downgrade' | 'renewal' | 'cancellation' | 'volunteer_toggle' | 'leader_application';
  userId: string;
  from?: MembershipType;
  to?: MembershipType;
  reason?: string;
  performedBy?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Extensión del Usuario existente para el nuevo sistema
export interface ExtendedUser {
  // Campos existentes del User.ts
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string; // Se mantiene para compatibilidad
  membershipNumber?: string;
  joinDate?: Date;
  isActive: boolean;
  registeredEvents?: string[];
  
  // Nuevos campos para el sistema de membresías
  membership?: Membership;
  points?: number;
  volunteer?: boolean;
  membershipExpiry?: Date;
  membershipBenefits?: string[];
  pqrsd?: string[]; // Para contar voluntariados
  
  // Historial de actividades
  eventHistory?: Array<{
    eventId: string;
    type: 'attended' | 'organized' | 'volunteered';
    date: string;
    points: number;
  }>;
  
  // Estadísticas personales
  stats?: {
    totalEvents: number;
    totalVolunteering: number;
    totalPoints: number;
    joinedDate: string;
    lastActivity: string;
  };
}