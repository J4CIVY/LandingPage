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
 * GET /api/contact/[id]
 * Obtiene un mensaje de contacto específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const message = db.getContactMessageById(id);
  
  if (!message) {
    return createErrorResponse(
      'Mensaje de contacto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { message },
    'Mensaje de contacto obtenido exitosamente'
  );
}

/**
 * PUT /api/contact/[id]
 * Actualiza el estado de un mensaje de contacto
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { status, response } = body;
    
    // Validar estado
    if (!status || !['new', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return createErrorResponse(
        'Estado inválido. Debe ser: new, in-progress, resolved o closed',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Verificar que el mensaje existe
    const existingMessage = db.getContactMessageById(id);
    if (!existingMessage) {
      return createErrorResponse(
        'Mensaje de contacto no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Preparar actualizaciones
    const updates: any = { status };
    if (response) {
      updates.response = response;
    }

    const updatedMessage = db.updateContactMessage(id, updates);
    
    if (!updatedMessage) {
      return createErrorResponse(
        'Error al actualizar mensaje de contacto',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Log del cambio de estado
    console.log(`📧 MENSAJE ${id} - Estado cambiado a: ${status.toUpperCase()}`);
    console.log(`👤 Remitente: ${updatedMessage.name} (${updatedMessage.email})`);

    // Simular envío de respuesta por email
    if (status === 'resolved' && response) {
      console.log(`📤 Respuesta enviada a ${updatedMessage.email}`);
    }

    return createSuccessResponse(
      { message: updatedMessage },
      'Mensaje de contacto actualizado exitosamente'
    );
  } catch (error) {
    return createErrorResponse(
      'Error al procesar la solicitud',
      HTTP_STATUS.BAD_REQUEST
    );
  }
}

/**
 * DELETE /api/contact/[id]
 * Marca un mensaje de contacto como cerrado
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const message = db.getContactMessageById(id);
  if (!message) {
    return createErrorResponse(
      'Mensaje de contacto no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Marcar como cerrado en lugar de eliminar
  const updatedMessage = db.updateContactMessage(id, { 
    status: 'closed'
  });
  
  if (!updatedMessage) {
    return createErrorResponse(
      'Error al cerrar mensaje',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  console.log(`🗑️ MENSAJE ${id} CERRADO`);

  return createSuccessResponse(
    { message: updatedMessage },
    'Mensaje de contacto cerrado exitosamente'
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
