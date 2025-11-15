import { NextRequest, connection } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse,
  getQueryParams
} from '@/lib/api-utils';
import { db } from '@/lib/database';

/**
 * GET /api/events/upcoming
 * Obtiene próximos eventos para la página principal
 */
async function handleGet(request: NextRequest) {
  const queryParams = getQueryParams(request);
  const limit = parseInt(queryParams.limit || '5', 10);
  
  const upcomingEvents = db.getUpcomingEvents(limit);
  
  return createSuccessResponse({
    events: upcomingEvents,
    total: upcomingEvents.length
  }, 'Próximos eventos obtenidos exitosamente');
}

export async function GET(request: NextRequest) {
  await connection();
  return withErrorHandling(handleGet)(request);
}
