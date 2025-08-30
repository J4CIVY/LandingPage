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
import { membershipApplicationSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/memberships
 * Obtiene aplicaciones de membresía con paginación
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
  
  const { page, limit } = paginationResult.data;
  const status = queryParams.status as 'pending' | 'approved' | 'rejected' | undefined;
  const membershipType = queryParams.membershipType;
  
  // Obtener todas las aplicaciones
  let applications = db.getAllMembershipApplications();
  
  // Aplicar filtros
  if (status) {
    applications = applications.filter(app => app.status === status);
  }
  
  if (membershipType) {
    applications = applications.filter(app => app.membershipType === membershipType);
  }
  
  // Ordenar por fecha de creación (más recientes primero)
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Aplicar paginación
  const total = applications.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = applications.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    applications: paginatedApplications,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    stats: {
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      total: applications.length
    }
  }, 'Aplicaciones de membresía obtenidas exitosamente');
}

/**
 * POST /api/memberships
 * Crea una nueva aplicación de membresía
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, membershipApplicationSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const applicationData = validation.data;
  
  // Verificar si ya existe una aplicación activa con el mismo email
  const existingApplication = db.getAllMembershipApplications().find(app => 
    app.email === applicationData.email && app.status === 'pending'
  );
  
  if (existingApplication) {
    return createErrorResponse(
      'Ya tienes una aplicación de membresía pendiente',
      HTTP_STATUS.CONFLICT
    );
  }
  
  const newApplication = db.createMembershipApplication({
    ...applicationData,
    status: 'pending'
  });
  
  // Simular notificación al equipo de administración
  console.log(`📋 NUEVA APLICACIÓN DE MEMBRESÍA: ${newApplication.membershipType.toUpperCase()}`);
  console.log(`👤 Solicitante: ${newApplication.name} (${newApplication.email})`);
  
  return createSuccessResponse(
    { 
      application: newApplication,
      message: 'Tu aplicación ha sido recibida. Te contactaremos pronto con más información.'
    },
    'Aplicación de membresía enviada exitosamente',
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
