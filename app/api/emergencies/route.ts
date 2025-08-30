import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  getQueryParams,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { emergencyRequestSchema, emergencyFiltersSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/emergencies
 * Obtiene emergencias con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  const queryParams = getQueryParams(request);
  
  // Validar parámetros de paginación
  const paginationResult = paginationSchema.safeParse(queryParams);
  if (!paginationResult.success) {
    return createErrorResponse(
      'Parámetros de paginación inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  // Validar filtros
  const filtersResult = emergencyFiltersSchema.safeParse(queryParams);
  if (!filtersResult.success) {
    return createErrorResponse(
      'Parámetros de filtro inválidos',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const { page, limit } = paginationResult.data;
  const filters = filtersResult.data;
  
  // Obtener todas las emergencias
  let emergencies = db.getAllEmergencies();
  
  // Aplicar filtros
  if (filters.status && filters.status !== 'all') {
    emergencies = emergencies.filter(emergency => emergency.status === filters.status);
  }
  
  if (filters.priority && filters.priority !== 'all') {
    emergencies = emergencies.filter(emergency => emergency.priority === filters.priority);
  }
  
  if (filters.emergencyType && filters.emergencyType !== 'all') {
    emergencies = emergencies.filter(emergency => emergency.emergencyType === filters.emergencyType);
  }
  
  // Ordenar por prioridad y fecha de creación
  emergencies.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Aplicar paginación
  const total = emergencies.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEmergencies = emergencies.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    emergencies: paginatedEmergencies,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    filters: filters
  }, 'Emergencias obtenidas exitosamente');
}

/**
 * POST /api/emergencies
 * Crea una nueva solicitud de emergencia
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, emergencyRequestSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const emergencyData = validation.data;
  
  // Determinar prioridad basada en el tipo de emergencia si no se especifica
  if (!emergencyData.priority) {
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      medical: 'critical',
      accident: 'critical',
      breakdown: 'high',
      mechanical: 'medium',
      other: 'medium'
    };
    emergencyData.priority = priorityMap[emergencyData.emergencyType] || 'medium';
  }
  
  const newEmergency = db.createEmergency({
    ...emergencyData,
    status: 'pending'
  });
  
  // Simular notificación a equipo de emergencias
  console.log(`🚨 NUEVA EMERGENCIA: ${newEmergency.emergencyType.toUpperCase()} - ${newEmergency.priority.toUpperCase()}`);
  console.log(`📍 Ubicación: ${newEmergency.location}`);
  console.log(`👤 Solicitante: ${newEmergency.name} (${newEmergency.contactPhone})`);
  
  return createSuccessResponse(
    { 
      emergency: newEmergency,
      message: 'Solicitud de emergencia recibida. El equipo de respuesta será notificado inmediatamente.'
    },
    'Emergencia reportada exitosamente',
    HTTP_STATUS.CREATED
  );
}

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
