import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';
import mongoose from 'mongoose';

/**
 * GET /api/admin/emergencies
 * Obtiene todas las emergencias con filtros y paginación para admin
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  
  // Parámetros de paginación
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;
  
  // Filtros
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const emergencyType = searchParams.get('emergencyType') || '';
  const assignedTo = searchParams.get('assignedTo') || '';
  
  // Ordenamiento
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  
  try {
    // Construir query
    const query: any = { isActive: true };
    
    // Filtro de búsqueda por nombre, memberId o descripción
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtros específicos
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (emergencyType && emergencyType !== 'all') {
      query.emergencyType = emergencyType;
    }
    
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        query.assignedTo = assignedTo;
      }
    }
    
    // Obtener emergencias con paginación
    const emergencies = await Emergency.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('memberRef', 'firstName lastName email phone')
      .exec();
    
    // Contar total de emergencias
    const totalEmergencies = await Emergency.countDocuments(query);
    const totalPages = Math.ceil(totalEmergencies / limit);
    
    // Calcular estadísticas
    const statistics = await Emergency.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          unassigned: { $sum: { $cond: [{ $eq: ['$assignedTo', null] }, 1, 0] } }
        }
      }
    ]);
    
    const stats = statistics[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      cancelled: 0,
      critical: 0,
      high: 0,
      unassigned: 0
    };
    
    return createSuccessResponse({
      emergencies,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalEmergencies,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: stats,
      filters: {
        search,
        status,
        priority,
        emergencyType,
        assignedTo,
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc'
      }
    }, 'Emergencias obtenidas exitosamente');
    
  } catch (error) {
    console.error('Error en GET /api/admin/emergencies:', error);
    throw error;
  }
}

/**
 * POST /api/admin/emergencies
 * Crea una nueva emergencia desde el admin
 */
async function handlePost(request: NextRequest) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  await connectDB();
  
  try {
    const rawBody = await request.json();
    
    // SECURITY: Sanitize user input to prevent XSS
    const { sanitizeApiInput } = await import('@/lib/api-sanitization');
    const emergencyData = sanitizeApiInput(rawBody, {
      name: 'text',
      memberId: 'none',
      emergencyType: 'text',
      description: 'html',
      location: 'text',
      contactPhone: 'phone',
      contactEmail: 'email',
      severity: 'text',
      notes: 'html',
      status: 'text',
      priority: 'text',
    });
    
    // Validación básica
    const requiredFields = ['name', 'memberId', 'emergencyType', 'description', 'location', 'contactPhone'];
    for (const field of requiredFields) {
      if (!emergencyData[field]) {
        return createErrorResponse(
          `Campo requerido faltante: ${field}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    // Crear nueva emergencia
    const newEmergency = new Emergency({
      ...emergencyData,
      status: emergencyData.status || 'pending',
      priority: emergencyData.priority || 'medium',
      isActive: true
    });
    
    await newEmergency.save();
    
    // Poblar datos para la respuesta
    await newEmergency.populate('assignedTo', 'firstName lastName email phone');
    await newEmergency.populate('memberRef', 'firstName lastName email phone');
    
    return createSuccessResponse(
      { emergency: newEmergency },
      'Emergencia creada exitosamente',
      HTTP_STATUS.CREATED
    );
    
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        `Error de validación: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    console.error('Error en POST /api/admin/emergencies:', error);
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
