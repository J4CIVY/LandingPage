import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/events/[id]/favorite
 * Agrega un evento a favoritos del usuario
 */
async function handlePost(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para agregar favoritos',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;
  
  // Verificar que el ID del evento es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar que el evento existe
  const event = await Event.findById(id);
  if (!event || !event.isActive) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Obtener el usuario
  const user = await User.findById(userId);
  if (!user) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Inicializar array de favoritos si no existe
  user.favoriteEvents = user.favoriteEvents || [];

  // Verificar si ya está en favoritos
  if (user.favoriteEvents.includes(id)) {
    return createErrorResponse(
      'El evento ya está en tus favoritos',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Agregar a favoritos
  user.favoriteEvents.push(id);
  await user.save();

  return createSuccessResponse(
    { 
      eventId: id,
      favoritesCount: user.favoriteEvents.length
    },
    'Evento agregado a favoritos exitosamente'
  );
}

/**
 * DELETE /api/events/[id]/favorite
 * Quita un evento de favoritos del usuario
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para quitar favoritos',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;
  
  // Verificar que el ID del evento es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Obtener el usuario
  const user = await User.findById(userId);
  if (!user) {
    return createErrorResponse(
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Verificar si está en favoritos
  if (!user.favoriteEvents || !user.favoriteEvents.includes(id)) {
    return createErrorResponse(
      'El evento no está en tus favoritos',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Quitar de favoritos
  user.favoriteEvents = user.favoriteEvents.filter(
    (eventId: mongoose.Types.ObjectId) => !eventId.equals(id)
  );
  await user.save();

  return createSuccessResponse(
    { 
      eventId: id,
      favoritesCount: user.favoriteEvents.length
    },
    'Evento quitado de favoritos exitosamente'
  );
}

export async function POST(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handlePost)(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleDelete)(request, context);
}
