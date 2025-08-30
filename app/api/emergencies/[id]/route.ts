import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { updateEmergencySchema } from '@/lib/validation-schemas';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/emergencies/[id]
 * Obtiene una emergencia específica por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const emergency = db.getEmergencyById(id);
  
  if (!emergency) {
    return createErrorResponse(
      'Emergencia no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { emergency },
    'Emergencia obtenida exitosamente'
  );
}

/**
 * PUT /api/emergencies/[id]
 * Actualiza el estado de una emergencia
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const validation = await validateRequestBody(request, updateEmergencySchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const updates = validation.data;
  
  // Verificar que la emergencia existe
  const existingEmergency = db.getEmergencyById(id);
  if (!existingEmergency) {
    return createErrorResponse(
      'Emergencia no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Validaciones de estado
  if (updates.status) {
    // No permitir reabrir emergencias resueltas o canceladas
    if (existingEmergency.status === 'resolved' && updates.status !== 'resolved') {
      return createErrorResponse(
        'No se puede reabrir una emergencia resuelta',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (existingEmergency.status === 'cancelled' && updates.status !== 'cancelled') {
      return createErrorResponse(
        'No se puede reabrir una emergencia cancelada',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Si se resuelve, requiere resolución
  if (updates.status === 'resolved' && !updates.resolution && !existingEmergency.resolution) {
    return createErrorResponse(
      'Se requiere una descripción de la resolución',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const updatedEmergency = db.updateEmergency(id, updates);
  
  if (!updatedEmergency) {
    return createErrorResponse(
      'Error al actualizar emergencia',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // Log de cambio de estado
  console.log(`🔄 EMERGENCIA ${id} - Estado cambiado a: ${updatedEmergency.status.toUpperCase()}`);
  if (updates.assignedTo) {
    console.log(`👤 Asignada a: ${updates.assignedTo}`);
  }

  return createSuccessResponse(
    { emergency: updatedEmergency },
    'Emergencia actualizada exitosamente'
  );
}

/**
 * DELETE /api/emergencies/[id]
 * Cancela una emergencia (soft delete)
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const emergency = db.getEmergencyById(id);
  if (!emergency) {
    return createErrorResponse(
      'Emergencia no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Solo permitir cancelar emergencias pendientes o en progreso
  if (emergency.status === 'resolved') {
    return createErrorResponse(
      'No se puede cancelar una emergencia ya resuelta',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (emergency.status === 'cancelled') {
    return createErrorResponse(
      'La emergencia ya está cancelada',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const updatedEmergency = db.updateEmergency(id, { 
    status: 'cancelled',
    resolution: 'Cancelada por solicitud del usuario'
  });
  
  if (!updatedEmergency) {
    return createErrorResponse(
      'Error al cancelar emergencia',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  console.log(`❌ EMERGENCIA ${id} CANCELADA`);

  return createSuccessResponse(
    { emergency: updatedEmergency },
    'Emergencia cancelada exitosamente'
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
