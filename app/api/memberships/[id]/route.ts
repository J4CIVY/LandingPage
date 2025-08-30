import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/memberships/[id]
 * Obtiene una aplicación de membresía específica por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const application = db.getMembershipApplicationById(id);
  
  if (!application) {
    return createErrorResponse(
      'Aplicación de membresía no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { application },
    'Aplicación de membresía obtenida exitosamente'
  );
}

/**
 * PUT /api/memberships/[id]
 * Actualiza el estado de una aplicación de membresía
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { status, notes } = body;
    
    // Validar estado
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return createErrorResponse(
        'Estado inválido. Debe ser: pending, approved o rejected',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que la aplicación existe
    const existingApplication = db.getMembershipApplicationById(id);
    if (!existingApplication) {
      return createErrorResponse(
        'Aplicación de membresía no encontrada',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Preparar actualizaciones
    const updates: any = { status };

    const updatedApplication = db.updateMembershipApplication(id, updates);
    
    if (!updatedApplication) {
      return createErrorResponse(
        'Error al actualizar aplicación de membresía',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Log del cambio de estado
    console.log(`📋 APLICACIÓN ${id} - Estado cambiado a: ${status.toUpperCase()}`);
    console.log(`👤 Aplicante: ${updatedApplication.name} (${updatedApplication.email})`);

    // Simular envío de email al aplicante
    if (status === 'approved') {
      console.log(`✅ Email de aprobación enviado a ${updatedApplication.email}`);
    } else if (status === 'rejected') {
      console.log(`❌ Email de rechazo enviado a ${updatedApplication.email}`);
    }

    return createSuccessResponse(
      { application: updatedApplication },
      'Aplicación de membresía actualizada exitosamente'
    );
  } catch (error) {
    return createErrorResponse(
      'Error al procesar la solicitud',
      HTTP_STATUS.BAD_REQUEST
    );
  }
}

/**
 * DELETE /api/memberships/[id]
 * Elimina una aplicación de membresía
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const application = db.getMembershipApplicationById(id);
  if (!application) {
    return createErrorResponse(
      'Aplicación de membresía no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Solo permitir eliminar aplicaciones rechazadas o muy antiguas
  if (application.status === 'approved') {
    return createErrorResponse(
      'No se puede eliminar una aplicación aprobada',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // En lugar de eliminar físicamente, marcamos como rechazada
  const updatedApplication = db.updateMembershipApplication(id, { 
    status: 'rejected'
  });
  
  if (!updatedApplication) {
    return createErrorResponse(
      'Error al eliminar aplicación',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  console.log(`🗑️ APLICACIÓN ${id} ELIMINADA/RECHAZADA`);

  return createSuccessResponse(
    { message: 'Aplicación de membresía eliminada exitosamente' },
    'Aplicación de membresía eliminada exitosamente'
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
