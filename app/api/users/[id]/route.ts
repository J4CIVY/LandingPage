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
 * GET /api/users/[id]
 * Obtiene un usuario específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const user = db.getUserById(id);
  
  if (!user) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Retornar datos del usuario sin información sensible
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    city: user.city,
    country: user.country,
    membershipType: user.membershipType,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return createSuccessResponse(
    { user: userData },
    'Usuario obtenido exitosamente'
  );
}

/**
 * PUT /api/users/[id]
 * Actualiza un usuario específico
 */
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  try {
    const updates = await request.json();
    
    // Verificar que el usuario existe
    const existingUser = db.getUserById(id);
    if (!existingUser) {
      return createErrorResponse(
        'Usuario no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // No permitir actualizar ciertos campos
    const forbiddenFields = ['id', 'createdAt', 'documentNumber'];
    const hasForbidenField = Object.keys(updates).some(key => forbiddenFields.includes(key));
    
    if (hasForbidenField) {
      return createErrorResponse(
        'No se pueden actualizar campos protegidos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Actualizar usuario
    const updatedUser = db.updateUser(id, updates);
    
    if (!updatedUser) {
      return createErrorResponse(
        'Error al actualizar usuario',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return createSuccessResponse(
      {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          membershipType: updatedUser.membershipType,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt
        }
      },
      'Usuario actualizado exitosamente'
    );
  } catch (error) {
    return createErrorResponse(
      'Error al procesar la solicitud',
      HTTP_STATUS.BAD_REQUEST
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Elimina un usuario específico (soft delete)
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  const user = db.getUserById(id);
  if (!user) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Soft delete - marcar como inactivo
  const updatedUser = db.updateUser(id, { isActive: false });
  
  if (!updatedUser) {
    return createErrorResponse(
      'Error al desactivar usuario',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return createSuccessResponse(
    { message: 'Usuario desactivado exitosamente' },
    'Usuario desactivado exitosamente'
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
