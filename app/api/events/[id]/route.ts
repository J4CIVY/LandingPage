import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import mongoose from 'mongoose';
import { requireCSRFToken } from '@/lib/csrf-protection';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/events/[id]
 * Obtiene un evento específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const event = await Event.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .exec();
  
  if (!event || !event.isActive) {
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
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  try {
    const updates = await request.json();
    
    // No permitir actualizar ciertos campos
    const forbiddenFields = ['_id', 'createdAt', 'attendees'];
    const hasForbidenField = Object.keys(updates).some(key => forbiddenFields.includes(key));
    
    if (hasForbidenField) {
      return createErrorResponse(
        'No se pueden actualizar campos protegidos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar fechas si se están actualizando
    if (updates.startDate) {
      const startDate = new Date(updates.startDate);
      if (startDate < new Date()) {
        return createErrorResponse(
          'La fecha de inicio no puede ser en el pasado',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    if (updates.endDate && updates.startDate) {
      const startDate = new Date(updates.startDate);
      const endDate = new Date(updates.endDate);
      if (endDate <= startDate) {
        return createErrorResponse(
          'La fecha de fin debe ser posterior a la fecha de inicio',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Actualizar evento
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');

    if (!updatedEvent || !updatedEvent.isActive) {
      return createErrorResponse(
        'Evento no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(
      { event: updatedEvent },
      'Evento actualizado exitosamente'
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

/**
 * DELETE /api/events/[id]
 * Elimina (desactiva) un evento específico
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // En lugar de eliminar, desactivar el evento
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { isActive: false, status: 'cancelled', updatedAt: new Date() },
    { new: true }
  );

  if (!updatedEvent) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { event: updatedEvent },
    'Evento cancelado exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteParams) {
  return withErrorHandling((req) => handleGet(req, context))(request);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return withErrorHandling((req) => handlePut(req, context))(request);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return withErrorHandling((req) => handleDelete(req, context))(request);
}
