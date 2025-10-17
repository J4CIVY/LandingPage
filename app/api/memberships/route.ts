import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import MembershipApplication from '@/lib/models/MembershipApplication';
import { membershipApplicationSchema } from '@/lib/validation-schemas';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/memberships
 * Obtiene aplicaciones de membresía (solo para administradores)
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const membershipType = searchParams.get('membershipType');
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (status) {
    mongoFilters.status = status;
  }
  
  if (membershipType) {
    mongoFilters.membershipType = membershipType;
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener aplicaciones con paginación
  const applications = await MembershipApplication.find(mongoFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reviewedBy', 'firstName lastName email')
    .populate('referredByMember', 'firstName lastName email')
    .exec();
  
  const totalApplications = await MembershipApplication.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    applications,
    pagination: {
      page,
      limit,
      total: totalApplications,
      pages: Math.ceil(totalApplications / limit)
    }
  }, 'Aplicaciones obtenidas exitosamente');
}

/**
 * POST /api/memberships
 * Crea una nueva aplicación de membresía
 */
async function handlePost(request: NextRequest) {
  // 0. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;

  await connectDB();
  
  const validation = await validateRequestBody(request, membershipApplicationSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const applicationData = validation.data;
  
  try {
    // Verificar si ya existe una aplicación activa con el mismo email
    const existingApplication = await MembershipApplication.findOne({
      email: applicationData.email,
      status: { $in: ['pending', 'approved'] },
      isActive: true
    });
    
    if (existingApplication) {
      return createErrorResponse(
        'Ya existe una aplicación activa con este email',
        HTTP_STATUS.CONFLICT
      );
    }
    
    // Obtener información adicional de la solicitud
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Crear nueva aplicación de membresía
    const newApplication = new MembershipApplication({
      ...applicationData,
      ipAddress: clientIP,
      userAgent,
      source: 'website'
    });
    
    await newApplication.save();
    
    // Retornar respuesta sin información sensible
    const responseData = {
      id: newApplication._id,
      name: newApplication.name,
      email: newApplication.email,
      membershipType: newApplication.membershipType,
      status: newApplication.status,
      createdAt: newApplication.createdAt
    };
    
    return createSuccessResponse(
      responseData,
      'Aplicación de membresía enviada exitosamente. Te contactaremos pronto.',
      HTTP_STATUS.CREATED
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

// Handlers principales
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
