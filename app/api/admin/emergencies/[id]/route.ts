import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';
import mongoose from 'mongoose';

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/emergencies/[id]
 * Obtiene una emergencia específica por ID para admin
 */
async function handleGet(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(
        'ID de emergencia inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const emergency = await Emergency.findById(id)
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('memberRef', 'firstName lastName email phone')
      .exec();
    
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
    
  } catch (error) {
    console.error('Error en GET /api/admin/emergencies/[id]:', error);
    throw error;
  }
}

/**
 * PUT /api/admin/emergencies/[id]
 * Actualiza una emergencia específica
 */
async function handlePut(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  await connectDB();
  
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(
        'ID de emergencia inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const updateData = await request.json();
    
    // Validar que la emergencia existe
    const existingEmergency = await Emergency.findById(id);
    if (!existingEmergency) {
      return createErrorResponse(
        'Emergencia no encontrada',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Campos que pueden ser actualizados
    const allowedUpdates = [
      'name', 'memberId', 'emergencyType', 'description', 'location',
      'contactPhone', 'priority', 'status', 'assignedTo', 'notes',
      'estimatedCost', 'finalCost', 'coordinates'
    ];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });
    
    // Manejar cambios de estado automáticos
    if (updates.status) {
      switch (updates.status) {
        case 'in-progress':
          if (!existingEmergency.startTime) {
            updates.startTime = new Date();
          }
          break;
        case 'resolved':
          if (!existingEmergency.endTime) {
            updates.endTime = new Date();
          }
          break;
        case 'cancelled':
          if (!existingEmergency.endTime) {
            updates.endTime = new Date();
          }
          break;
      }
    }
    
    // Actualizar emergencia
    const updatedEmergency = await Emergency.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('memberRef', 'firstName lastName email phone')
      .exec();
    
    return createSuccessResponse(
      { emergency: updatedEmergency },
      'Emergencia actualizada exitosamente'
    );
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    console.error('Error en PUT /api/admin/emergencies/[id]:', error);
    throw error;
  }
}

/**
 * DELETE /api/admin/emergencies/[id]
 * Elimina (desactiva) una emergencia específica
 */
async function handleDelete(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  await connectDB();
  
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(
        'ID de emergencia inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return createErrorResponse(
        'Emergencia no encontrada',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Soft delete - marcar como inactivo
    await Emergency.findByIdAndUpdate(
      id,
      { 
        isActive: false, 
        updatedAt: new Date(),
        deletedAt: new Date()
      }
    );
    
    return createSuccessResponse(
      null,
      'Emergencia eliminada exitosamente'
    );
    
  } catch (error) {
    console.error('Error en DELETE /api/admin/emergencies/[id]:', error);
    throw error;
  }
}

// Handlers principales
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handleGet)(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handlePut)(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handleDelete)(request, { params });
}
