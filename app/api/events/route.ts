import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  getQueryParams,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { eventSchema, eventFiltersSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/events
 * Obtiene eventos con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  const queryParams = getQueryParams(request);
  
  // Validar parámetros de paginación
  const paginationResult = paginationSchema.safeParse(queryParams);
  if (!paginationResult.success) {
    return createErrorResponse(
      'Parámetros de paginación inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // Validar filtros
  const filtersResult = eventFiltersSchema.safeParse(queryParams);
  if (!filtersResult.success) {
    return createErrorResponse(
      'Parámetros de filtro inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const { page, limit } = paginationResult.data;
  const filters = filtersResult.data;
  
  // Obtener eventos basados en filtros
  let events = filters.upcoming 
    ? db.getUpcomingEvents() 
    : db.getAllEvents();
  
  // Aplicar filtros adicionales
  if (filters.eventType) {
    events = events.filter(event => 
      event.eventType.toLowerCase().includes(filters.eventType!.toLowerCase())
    );
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    events = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.eventType.toLowerCase().includes(searchTerm)
    );
  }
  
  // Aplicar paginación
  const total = events.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = events.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    events: paginatedEvents,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    filters: filters
  }, 'Eventos obtenidos exitosamente');
}

/**
 * POST /api/events
 * Crea un nuevo evento
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, eventSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const eventData = validation.data;
  
  // Verificar que la fecha del evento sea futura
  const eventDate = new Date(eventData.startDate);
  const now = new Date();
  
  if (eventDate <= now) {
    return createErrorResponse(
      'La fecha del evento debe ser futura',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // Verificar si ya existe un evento con el mismo nombre y fecha
  const existingEvent = db.getAllEvents().find(e => 
    e.name.toLowerCase() === eventData.name.toLowerCase() &&
    e.startDate === eventData.startDate
  );
  
  if (existingEvent) {
    return createErrorResponse(
      'Ya existe un evento con el mismo nombre y fecha',
      HTTP_STATUS.CONFLICT
    );
  }
  
  const newEvent = db.createEvent(eventData);
  
  return createSuccessResponse(
    { event: newEvent },
    'Evento creado exitosamente',
    HTTP_STATUS.CREATED
  );
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
