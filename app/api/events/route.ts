import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

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
    };
    
      eventCount: result.events.length, 
      total: result.pagination.total 
    });
    
    return createSuccessResponse(result, 'Eventos obtenidos exitosamente');
    
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
  await connectDB();
  
  try {
    const eventData = await request.json();
    
    // Validaciones básicas
    if (!eventData.name || !eventData.startDate) {
      return createErrorResponse(
        'Nombre y fecha de inicio son requeridos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar formato de fechas
    const startDate = new Date(eventData.startDate);
    if (isNaN(startDate.getTime())) {
      return createErrorResponse(
        'Formato de fecha de inicio inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que la fecha de inicio no sea en el pasado (con margen de 1 hora)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (startDate < oneHourAgo) {
      return createErrorResponse(
        'La fecha de inicio no puede ser en el pasado',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que la fecha de fin sea posterior a la de inicio
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate);
      if (isNaN(endDate.getTime())) {
        return createErrorResponse(
          'Formato de fecha de fin inválido',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      if (endDate <= startDate) {
        return createErrorResponse(
          'La fecha de fin debe ser posterior a la fecha de inicio',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    // Validaciones adicionales
    if (!eventData.description || eventData.description.trim() === '') {
      return createErrorResponse(
        'La descripción es requerida',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (!eventData.mainImage || eventData.mainImage.trim() === '') {
      return createErrorResponse(
        'La imagen principal es requerida',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (!eventData.eventType || eventData.eventType.trim() === '') {
      return createErrorResponse(
        'El tipo de evento es requerido',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Validar organizador
    if (!eventData.organizer || 
        !eventData.organizer.name || 
        !eventData.organizer.phone || 
        !eventData.organizer.email) {
      return createErrorResponse(
        'La información completa del organizador es requerida',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar ubicación de salida
    if (!eventData.departureLocation || 
        !eventData.departureLocation.address || 
        !eventData.departureLocation.city || 
        !eventData.departureLocation.country) {
      return createErrorResponse(
        'La información completa de la ubicación de salida es requerida',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Crear nuevo evento
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // Poblar información del organizador
    await newEvent.populate('createdBy', 'firstName lastName email');
    
    return createSuccessResponse(
      newEvent,
      'Evento creado exitosamente',
      HTTP_STATUS.CREATED
    );
    
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación: ${error.message}`,
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
