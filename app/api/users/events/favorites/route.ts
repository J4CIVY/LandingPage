import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/users/events/favorites
 * Obtiene la lista de eventos favoritos del usuario
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para ver tus favoritos',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;

  try {
    // Obtener el usuario con los eventos favoritos
    const user = await User.findById(userId)
      .populate({
        path: 'favoriteEvents',
        select: 'name startDate endDate description mainImage eventType status',
        match: { isActive: true }
      })
      .select('favoriteEvents');

    if (!user) {
      return createErrorResponse(
        'Usuario no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Extraer solo los IDs de los eventos para el componente
    const favorites = user.favoriteEvents ? user.favoriteEvents.map((event: any) => event._id.toString()) : [];

    return createSuccessResponse(
      { 
        favorites,
        events: user.favoriteEvents || []
      },
      'Favoritos obtenidos exitosamente'
    );

  } catch (error: any) {
    console.error('Error fetching user favorites:', error);
    return createErrorResponse(
      'Error al obtener los favoritos',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
