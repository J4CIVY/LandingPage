import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';
import { emergencyRequestSchema } from '@/lib/validation-schemas';

/**
 * GET /api/emergencies
 * Obtiene emergencias con filtros y paginación
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const emergencyType = searchParams.get('emergencyType');
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (status) {
    mongoFilters.status = status;
  }
  
  if (priority) {
    mongoFilters.priority = priority;
  }
  
  if (emergencyType) {
    mongoFilters.emergencyType = emergencyType;
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener emergencias con paginación
  const emergencies = await Emergency.find(mongoFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'firstName lastName phone')
    .populate('respondedBy', 'firstName lastName')
    .exec();
  
  const totalEmergencies = await Emergency.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    emergencies,
    pagination: {
      page,
      limit,
      total: totalEmergencies,
      pages: Math.ceil(totalEmergencies / limit)
    }
  }, 'Emergencias obtenidas exitosamente');
}

/**
 * POST /api/emergencies
 * Crea una nueva emergencia SOS
 */
async function handlePost(request: NextRequest) {
  await connectDB();
  
  const validation = await validateRequestBody(request, emergencyRequestSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const emergencyData = validation.data;
  
  try {
    // Obtener información adicional de la solicitud
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Crear nueva emergencia
    const newEmergency = new Emergency({
      ...emergencyData,
      ipAddress: clientIP,
      userAgent,
      reportedAt: new Date()
    });
    
    await newEmergency.save();
    
    // Retornar respuesta con información relevante
    const responseData = {
      id: newEmergency._id,
      emergencyId: newEmergency.emergencyId,
      name: newEmergency.name,
      emergencyType: newEmergency.emergencyType,
      priority: newEmergency.priority,
      status: newEmergency.status,
      reportedAt: newEmergency.reportedAt,
      estimatedResponseTime: newEmergency.estimatedResponseTime
    };
    
    return createSuccessResponse(
      responseData,
      'Emergencia reportada exitosamente. Ayuda en camino.',
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
