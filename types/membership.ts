export type MembershipType = 'Friend' | 'Rider' | 'Pro' | 'Legend' | 'Master' | 'Volunteer' | 'Leader';

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface RequirementStatus {
  id: string;
  label: string;
  fulfilled: boolean;
  progress: number;
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

export interface VolunteerContributions {
  totalContributions: number;
  monthlyAverage: number;
  meetsMinimumContribution: boolean;
  breakdown: {
    eventOrganization: number;
    logisticsSupport: number;
    communityProjects: number;
    safetyPrograms: number;
    socialCampaigns: number;
    mentorshipActivities: number;
  };
  impactClassification: {
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
  };
}

export interface VolunteerBenefitsEligibility {
  eligibleBenefits: string[];
  contributionLevel: 'low' | 'medium' | 'high';
  hasFullAccess: boolean;
  mainMembershipBonus: boolean;
}

export interface VolunteerStatus {
  isVolunteer: boolean;
  status: 'active' | 'pending' | 'inactive';
  requirements: RequirementStatus[];
  contributions: VolunteerContributions;
  benefitsEligibility: VolunteerBenefitsEligibility;
  specialFeatures: {
    isComplementary: boolean;
    enhancesMainMembership: boolean;
    flexibleDuration: boolean;
    additionalPoints: boolean;
  };
}

export interface MembershipResponse {
  userId: string;
  membership: Membership;
  ranking: UserRanking;
  achievements: Achievement[];
  volunteerInfo?: VolunteerStatus | null;
}

// Request/Response types para los endpoints (mantener si hay contexto útil)
export interface RenewMembershipRequest {
  userId?: string;
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

// Reglas de negocio para requisitos de cada membresía (mantener si hay contexto útil)
export interface FriendRequirements {
  pointsRequired: 0;
  eventsRequired: 0;
  volunteeringRequired: 0;
  timeRequired: 0;
  // Configuración especial para Friend → Rider (mantener si hay contexto útil)
  nextLevelRequirements?: {
    pointsRequired: number;
  eventsRequired: number;
    volunteeringRequired: number;
  timeRequired: number;
    minimumDaysForUpgrade: number;
    leapYearDays: number;
  eventPercentageRequired: number;
  };
}

export interface StandardMembershipRequirements {
  pointsRequired: number;
  eventsRequired: number;
  volunteeringRequired: number;
  timeRequired: number;
}

export interface RiderRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
  confirmedEventsOnly: boolean;
  cleanRecord: boolean;
  fromMembershipType: MembershipType;
  };
}

export interface ProRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
  lastYearPoints: number;
  confirmedEventsOnly: boolean;
  digitalParticipation: boolean;
  cleanRecord: boolean;
  fromMembershipType: MembershipType;
  };
}

export interface LegendRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
  lastYearPoints: number;
  confirmedEventsOnly: boolean;
    eventTypeDistribution: {
  communityEvents: number;
  educationalEvents: number;
    };
  demonstrableContribution: boolean;
  cleanRecord: boolean;
  fromMembershipType: MembershipType;
  };
}

export interface MasterRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
  lastYearPoints: number;
  confirmedEventsOnly: boolean;
    eventTypeDistribution: {
  communityEvents: number;
  educationalEvents: number;
  organizedEvents: number;
    };
  outstandingProjectParticipation: boolean;
  officialRecognition: boolean;
  fromMembershipType: MembershipType;
  };
}

export interface LeaderRequirements extends StandardMembershipRequirements {
  specialRequirements?: {
  // Requisitos básicos obligatorios (mantener si hay contexto útil)
  mustBeMaster: boolean;
  mustBeActiveVolunteer: boolean;
  pointsMinimum: number;
    
  // Historial de eventos (mantener si hay contexto útil)
  eventAttendanceRate: number;
  leadershipEventsRequired: number;
  leadershipEventsSuccessRate: number;
    
  // Voluntariado alto impacto (mantener si hay contexto útil)
  highImpactVolunteering: boolean;
  highImpactVolunteeringRequired: number;
  highImpactRoles: string[];
    
  // Historial disciplinario (mantener si hay contexto útil)
  cleanDisciplinaryRecord: boolean;
  noSuspensions: boolean;
  noGraveWarnings: boolean;
  noRuleViolations: boolean;
    
  // Proceso de postulación formal (mantener si hay contexto útil)
    formalApplication: {
  leadershipPlanRequired: boolean;
  applicationFormRequired: boolean;
      endorsements: {
  activeLeadersRequired: number;
  activeMastersRequired: number;
      };
    };
    
  // Proceso de evaluación (mantener si hay contexto útil)
    evaluationProcess: {
  evaluationCommittee: boolean;
  publicInterview: boolean;
  consultativeVoting: boolean;
  presidentialRatification: boolean;
  boardConfirmation: boolean;
    };
    
  // Disponibilidad operativa (mantener si hay contexto útil)
    minimumAvailability: {
  hoursPerMonth: number;
  maxHoursPerMonth: number;
  meetingsRequired: boolean;
  coordinationRequired: boolean;
  eventPresenceRequired: boolean;
    };
    
  // Condiciones especiales (mantener si hay contexto útil)
  mandateDuration: number;
  renewable: boolean;
  vacancyRequired: boolean;
  exemplaryConduct: boolean;
    
  fromMembershipType: MembershipType;
  };
}

export interface MembershipRules {
  Friend: FriendRequirements;
  Rider: RiderRequirements;
  Pro: ProRequirements;
  Legend: LegendRequirements;
  Master: MasterRequirements;
  Volunteer: {
  // Se puede agregar a cualquier tipo (mantener si hay contexto útil)
    canAttachTo: MembershipType[];
    requirements?: {
      activeCommitment: boolean;
      clubValuesAlignment: boolean;
      minimumContribution: number;
      flexibleDuration: boolean;
    };
    additionalBenefits: string[];
    specialFeatures?: {
      isComplementary: boolean;
      doesNotCompete: boolean;
      flexibleCommitment: boolean;
      enhancesProgression: boolean;
    };
  };
  Leader: LeaderRequirements;
}

// Beneficios por tipo de membresía (mantener si hay contexto útil)
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

// Configuración visual para cada tipo de membresía (mantener si hay contexto útil)
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

// Tipos para manejo de errores en API (mantener si hay contexto útil)
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

// Eventos del sistema para tracking (mantener si hay contexto útil)
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

// Extensión del Usuario existente para el nuevo sistema (mantener si hay contexto útil)
export interface ExtendedUser {
  // Campos existentes del User.ts (mantener si hay contexto útil)
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  membershipNumber?: string;
  joinDate?: Date;
  isActive: boolean;
  registeredEvents?: string[];
  
  // Nuevos campos para el sistema de membresías (mantener si hay contexto útil)
  membership?: Membership;
  points?: number;
  volunteer?: boolean;
  membershipExpiry?: Date;
  membershipBenefits?: string[];
  pqrsd?: string[];
  
  // Historial de actividades (mantener si hay contexto útil)
  eventHistory?: Array<{
    eventId: string;
    type: 'attended' | 'organized' | 'volunteered';
    date: string;
    points: number;
  }>;
  
  // Estadísticas personales (mantener si hay contexto útil)
  stats?: {
    totalEvents: number;
    totalVolunteering: number;
    totalPoints: number;
    joinedDate: string;
    lastActivity: string;
  };
}