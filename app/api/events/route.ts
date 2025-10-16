import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { eventSchema } from '@/lib/validation-schemas';

/**
 * GET /api/events
 * Obtiene eventos con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const upcoming = searchParams.get('upcoming') === 'true';
    
    
    // Construir filtros de MongoDB
    const mongoFilters: any = { isActive: true };
    
    if (upcoming) {
      const now = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(now.getMonth() + 6);
      
      mongoFilters.startDate = { 
        $gte: now,
        $lte: sixMonthsFromNow
      };
    }
    
    
    // Calcular skip para paginación
    const skip = (page - 1) * limit;
    
    // Primero verificar si hay eventos en total
    const totalEvents = await Event.countDocuments({});
    
    const totalActiveEvents = await Event.countDocuments(mongoFilters);
    
    // Obtener eventos
    const events = await Event.find(mongoFilters)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    
    // Agregar campos virtuales manualmente
    const eventsWithVirtuals = events.map(event => {
      const now = new Date();
      const registrationDeadline = event.registrationDeadline || event.startDate;
      const isFull = event.maxParticipants !== undefined && 
                     event.currentParticipants >= event.maxParticipants;
      
      return {
        ...event,
        isRegistrationOpen: now < registrationDeadline && 
                           event.status === 'published' && 
                           !isFull,
        isFull,
        isPast: event.endDate ? now > event.endDate : now > event.startDate
      };
    });
    
    const result = {
      events: eventsWithVirtuals,
      pagination: {
        page,
        limit,
        total: totalActiveEvents,
        pages: Math.ceil(totalActiveEvents / limit)
        }
      };    return createSuccessResponse(result, 'Eventos obtenidos exitosamente');
    
  } catch (error: any) {
    console.error('❌ API Events: Error:', error);
    return createErrorResponse(
      `Error interno del servidor: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/events
 * Crea un nuevo evento
 */
async function handlePost(request: NextRequest) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  try {
    const body = await request.json();
    
    // 1. Validate request body with eventSchema
    const validationResult = await validateRequestBody(body, eventSchema);
    if (!validationResult.success) {
      return validationResult.response;
    }
    
    const eventData = validationResult.data;
    
    // 2. Additional business logic validations
    const startDate = new Date(eventData.startDate);
    
    // Verificar que la fecha de inicio no sea en el pasado (con margen de 1 hora)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (startDate < oneHourAgo) {
      return createErrorResponse(
        'La fecha de inicio no puede ser en el pasado',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar fechas de registro si están presentes
    if (eventData.registrationOpenDate) {
      const registrationOpen = new Date(eventData.registrationOpenDate);
      if (registrationOpen >= startDate) {
        return createErrorResponse(
          'La fecha de apertura de registro debe ser anterior a la fecha de inicio',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    if (eventData.registrationDeadline) {
      const registrationDeadline = new Date(eventData.registrationDeadline);
      if (registrationDeadline >= startDate) {
        return createErrorResponse(
          'La fecha límite de registro debe ser anterior a la fecha de inicio',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      if (eventData.registrationOpenDate) {
        const registrationOpen = new Date(eventData.registrationOpenDate);
        if (registrationDeadline <= registrationOpen) {
          return createErrorResponse(
            'La fecha límite de registro debe ser posterior a la fecha de apertura',
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }
    }
    
    // 3. Crear nuevo evento
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // 4. Poblar información del organizador si existe
    if (newEvent.createdBy) {
      await newEvent.populate('createdBy', 'firstName lastName email');
    }
    
    return createSuccessResponse(
      newEvent,
      'Evento creado exitosamente',
      HTTP_STATUS.CREATED
    );
    
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación de MongoDB: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    throw error;
  }
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
