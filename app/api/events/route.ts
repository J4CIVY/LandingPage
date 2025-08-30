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
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const upcoming = searchParams.get('upcoming') === 'true';
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (status) {
    mongoFilters.status = status;
  }
  
  if (category) {
    mongoFilters.category = category;
  }
  
  if (upcoming) {
    mongoFilters.startDate = { $gte: new Date() };
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener eventos con paginación
  const events = await Event.find(mongoFilters)
    .sort({ startDate: 1 }) // Ordenar por fecha de inicio
    .skip(skip)
    .limit(limit)
    .populate('organizer', 'firstName lastName email')
    .exec();
  
  const totalEvents = await Event.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    events,
    pagination: {
      page,
      limit,
      total: totalEvents,
      pages: Math.ceil(totalEvents / limit)
    }
  }, 'Eventos obtenidos exitosamente');
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
    if (!eventData.title || !eventData.startDate) {
      return createErrorResponse(
        'Título y fecha de inicio son requeridos',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que la fecha de inicio no sea en el pasado
    const startDate = new Date(eventData.startDate);
    if (startDate < new Date()) {
      return createErrorResponse(
        'La fecha de inicio no puede ser en el pasado',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que la fecha de fin sea posterior a la de inicio
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate);
      if (endDate <= startDate) {
        return createErrorResponse(
          'La fecha de fin debe ser posterior a la fecha de inicio',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    // Crear nuevo evento
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // Poblar información del organizador
    await newEvent.populate('organizer', 'firstName lastName email');
    
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
