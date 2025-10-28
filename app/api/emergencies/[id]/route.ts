import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';
import mongoose from 'mongoose';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/emergencies/[id]
 * Obtiene una emergencia específica por ID
 */
async function handleGet(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de emergencia inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const emergency = await Emergency.findById(id)
    .populate('assignedTo', 'firstName lastName phone email')
    .populate('respondedBy', 'firstName lastName')
    .exec();
  
  if (!emergency || !emergency.isActive) {
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
 * Actualiza una emergencia específica
 */
async function handlePut(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de emergencia inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  try {
    const updates = await request.json();
    
    // No permitir actualizar ciertos campos
    const forbiddenFields = ['_id', 'createdAt', 'emergencyId', 'reportedAt'];
    const hasForbidenField = Object.keys(updates).some(key => forbiddenFields.includes(key));
    
    if (hasForbidenField) {
      return createErrorResponse(
        'No se pueden actualizar campos protegidos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Si se está cambiando a resuelto, establecer fecha de resolución
    if (updates.status === 'resolved' && !updates.resolvedAt) {
      updates.resolvedAt = new Date();
    }
    
    // Si se está asignando, establecer fecha de asignación
    if (updates.assignedTo && !updates.assignedAt) {
      updates.assignedAt = new Date();
    }

    // Actualizar emergencia
    const updatedEmergency = await Emergency.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName phone email')
     .populate('respondedBy', 'firstName lastName');

    if (!updatedEmergency || !updatedEmergency.isActive) {
      return createErrorResponse(
        'Emergencia no encontrada',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(
      { emergency: updatedEmergency },
      'Emergencia actualizada exitosamente'
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
 * DELETE /api/emergencies/[id]
 * Cancela una emergencia específica
 */
async function handleDelete(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await context.params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de emergencia inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // Cambiar estado a cancelado en lugar de eliminar
  const updatedEmergency = await Emergency.findByIdAndUpdate(
    id,
    { 
      status: 'cancelled', 
      resolvedAt: new Date(),
      resolution: 'Emergencia cancelada por el usuario',
      updatedAt: new Date() 
    },
    { new: true }
  );

  if (!updatedEmergency) {
    return createErrorResponse(
      'Emergencia no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { emergency: updatedEmergency },
    'Emergencia cancelada exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  return withErrorHandling((req) => handleGet(req, context))(request);
}

export async function PUT(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  return withErrorHandling((req) => handlePut(req, context))(request);
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/emergencies/[id]'>) {
  return withErrorHandling((req) => handleDelete(req, context))(request);
}
