// Tipos principales para eventos
export interface Event {
  _id: string;
  name: string;
  startDate: string;
  endDate?: string;
  description: string;
  longDescription?: string;
  mainImage: string;
  gallery?: string[];
  detailsPdf?: string; // URL del PDF con detalles del evento
  eventType: EventType;
  status: EventStatus;
  departureLocation?: EventLocation;
  arrivalLocation?: EventLocation;
  maxParticipants?: number;
  currentParticipants: number;
  registrationOpenDate?: string; // Fecha de apertura de inscripciones  
  registrationDeadline?: string;
  price?: number;
  nonMemberPrice?: number; // Precio para no miembros
  includedServices?: string[];
  requirements?: string[];
  difficulty?: EventDifficulty;
  distance?: number;
  duration?: number;
  pointsAwarded?: number; // Puntos que otorga este evento
  organizer: EventOrganizer;
  participants?: string[];
  attendedParticipants?: string[];
  tags?: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals del backend
  isFull?: boolean;
  isRegistrationOpen?: boolean;
  isPast?: boolean;
}

export interface EventLocation {
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventOrganizer {
  name: string;
  phone: string;
  email: string;
}

// Enums y tipos auxiliares
export type EventType = 
  | 'Rally'
  | 'Taller'
  | 'Charla'
  | 'Rodada'
  | 'Concentración'
  | 'Competencia'
  | 'Social'
  | 'Mantenimiento'
  | 'Turismo'
  | 'Beneficencia';

export type EventStatus = 
  | 'draft'
  | 'published'
  | 'cancelled'
  | 'completed';

export type EventDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

// Estados de visualización para filtros
export type EventDisplayStatus = 
  | 'upcoming'    // Próximos
  | 'ongoing'     // En curso
  | 'finished'    // Finalizados
  | 'all';        // Todos

// Interfaces para filtros
export interface EventFilters {
  search: string;
  eventType: EventType | 'all';
  status: EventDisplayStatus;
  dateFrom?: string;
  dateTo?: string;
  location: string;
  myEvents: boolean;
  difficulty?: EventDifficulty | 'all';
}

// Interface para la respuesta de la API
export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

// Interface para crear/editar eventos
export interface CreateEventData {
  name: string;
  startDate: string;
  endDate?: string;
  description: string;
  longDescription?: string;
  mainImage: string;
  gallery?: string[];
  detailsPdf?: string; // URL del PDF con detalles del evento
  eventType: EventType;
  status: EventStatus;
  departureLocation: EventLocation;
  arrivalLocation?: EventLocation;
  maxParticipants?: number;
  registrationOpenDate?: string; // Fecha de apertura de inscripciones
  registrationDeadline?: string;
  price?: number;
  nonMemberPrice?: number; // Precio para no miembros
  includedServices?: string[];
  requirements?: string[];
  difficulty?: EventDifficulty;
  distance?: number;
  duration?: number;
  pointsAwarded?: number; // Puntos que otorga este evento
  organizer: EventOrganizer;
  tags?: string[];
}

// Interface para inscripción de usuarios
export interface EventRegistration {
  eventId: string;
  userId: string;
  registrationDate: string;
  status: 'registered' | 'attended' | 'cancelled';
  notes?: string;
}
