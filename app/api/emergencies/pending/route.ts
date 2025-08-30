import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse
} from '@/lib/api-utils';
import { db } from '@/lib/database';

/**
 * GET /api/emergencies/pending
 * Obtiene emergencias pendientes ordenadas por prioridad
 */
async function handleGet(request: NextRequest) {
  const pendingEmergencies = db.getPendingEmergencies();
  
  return createSuccessResponse({
    emergencies: pendingEmergencies,
    total: pendingEmergencies.length,
    stats: {
      critical: pendingEmergencies.filter(e => e.priority === 'critical').length,
      high: pendingEmergencies.filter(e => e.priority === 'high').length,
      medium: pendingEmergencies.filter(e => e.priority === 'medium').length,
      low: pendingEmergencies.filter(e => e.priority === 'low').length
    }
  }, 'Emergencias pendientes obtenidas exitosamente');
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
