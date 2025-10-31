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
 * GET /api/users/events/registrations
 * Obtiene la lista de eventos en los que el usuario está registrado
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para ver tus registros',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;

  try {
    // Obtener el usuario con los eventos registrados
    const user = await User.findById(userId)
      .populate({
        path: 'events',
        select: 'name startDate endDate description mainImage eventType status',
        match: { isActive: true }
      })
      .select('events');

    if (!user) {
      return createErrorResponse(
        'Usuario no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Extraer solo los IDs de los eventos para el componente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registrations = user.events ? user.events.map((event: any) => event._id.toString()) : [];

    return createSuccessResponse(
      { 
        registrations,
        events: user.events || []
      },
      'Registros obtenidos exitosamente'
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching user registrations:', error);
    return createErrorResponse(
      'Error al obtener los registros',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
