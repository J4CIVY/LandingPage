import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { updateEventSchema } from '@/lib/validation-schemas';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/events/[id]
 * Obtiene un evento específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const event = db.getEventById(id);
  
  if (!event) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { event },
    'Evento obtenido exitosamente'
  );
}

/**
 * PUT /api/events/[id]
 * Actualiza un evento específico
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const validation = await validateRequestBody(request, updateEventSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const updates = validation.data;
  
  // Verificar que el evento existe
  const existingEvent = db.getEventById(id);
  if (!existingEvent) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Si se actualiza la fecha, verificar que sea futura
  if (updates.startDate) {
    const eventDate = new Date(updates.startDate);
    const now = new Date();
    
    if (eventDate <= now) {
      return createErrorResponse(
        'La fecha del evento debe ser futura',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Si se actualiza el nombre o fecha, verificar duplicados
  if (updates.name || updates.startDate) {
    const checkName = updates.name || existingEvent.name;
    const checkDate = updates.startDate || existingEvent.startDate;
    
    const duplicateEvent = db.getAllEvents().find(e => 
      e.id !== id &&
      e.name.toLowerCase() === checkName.toLowerCase() &&
      e.startDate === checkDate
    );
    
    if (duplicateEvent) {
      return createErrorResponse(
        'Ya existe un evento con el mismo nombre y fecha',
        HTTP_STATUS.CONFLICT
      );
    }
  }

  const updatedEvent = db.updateEvent(id, updates);
  
  if (!updatedEvent) {
    return createErrorResponse(
      'Error al actualizar evento',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return createSuccessResponse(
    { event: updatedEvent },
    'Evento actualizado exitosamente'
  );
}

/**
 * DELETE /api/events/[id]
 * Elimina un evento específico
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const event = db.getEventById(id);
  if (!event) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Verificar si el evento ya comenzó
  const eventDate = new Date(event.startDate);
  const now = new Date();
  
  if (eventDate <= now) {
    return createErrorResponse(
      'No se puede eliminar un evento que ya comenzó',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const deleted = db.deleteEvent(id);
  
  if (!deleted) {
    return createErrorResponse(
      'Error al eliminar evento',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return createSuccessResponse(
    { message: 'Evento eliminado exitosamente' },
    'Evento eliminado exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleGet)(request, context);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handlePut)(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleDelete)(request, context);
}
