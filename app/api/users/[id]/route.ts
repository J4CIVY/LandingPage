import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import { requireCSRFToken } from '@/lib/csrf-protection';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]
 * Obtiene un usuario específico por ID
 */
async function handleGet(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de usuario inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const user = await User.findById(id).select('-password').exec();
  
  if (!user) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Retornar datos del usuario sin información sensible
  const userData = {
    id: user._id,
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
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const { id } = await params;
  
  // Verificar que el ID es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de usuario inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  try {
    const updates = await request.json();
    
    // No permitir actualizar ciertos campos
    const forbiddenFields = ['_id', 'createdAt', 'password'];
    const hasForbidenField = Object.keys(updates).some(key => forbiddenFields.includes(key));
    
    if (hasForbidenField) {
      return createErrorResponse(
        'No se pueden actualizar campos protegidos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Si se está actualizando el email, verificar que no exista
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return createErrorResponse(
          'El email ya está en uso por otro usuario',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return createErrorResponse(
        'Usuario no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(
      { user: updatedUser },
      'Usuario actualizado exitosamente'
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
 * DELETE /api/users/[id]
 * Elimina (desactiva) un usuario específico
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
      'ID de usuario inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // En lugar de eliminar, desactivar el usuario
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return createSuccessResponse(
    { user: updatedUser },
    'Usuario desactivado exitosamente'
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
