import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/contact/[id]
 * Obtiene un mensaje de contacto específico por ID
 */
async function handleGet(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  const { id } = await context.params;
  
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
async function handlePut(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  const { id } = await context.params;
  
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.log(`Mensaje de contacto ${id} actualizado a estado: ${status}`);

    // Simular envío de respuesta por email
    if (status === 'resolved' && response) {
      console.log(`Enviando respuesta a ${existingMessage.email}`);
    }

    return createSuccessResponse(
      { message: updatedMessage },
      'Mensaje de contacto actualizado exitosamente'
    );
  } catch {
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
async function handleDelete(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  const { id } = await context.params;
  
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


  return createSuccessResponse(
    { message: updatedMessage },
    'Mensaje de contacto cerrado exitosamente'
  );
}

// Handlers principales
export async function GET(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  return withErrorHandling(handleGet)(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  return withErrorHandling(handlePut)(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/contact/[id]'>) {
  return withErrorHandling(handleDelete)(request, context);
}
