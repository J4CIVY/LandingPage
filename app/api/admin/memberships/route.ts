import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import MembershipApplication from '@/lib/models/MembershipApplication';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

// Función auxiliar para verificar autenticación de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return { success: false, error: 'Token de acceso requerido', status: HTTP_STATUS.UNAUTHORIZED };
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !['admin', 'super-admin'].includes(user.role)) {
      return { success: false, error: 'Acceso denegado', status: HTTP_STATUS.FORBIDDEN };
    }

    return { success: true, user };
  } catch {
    return { success: false, error: 'Token inválido', status: HTTP_STATUS.UNAUTHORIZED };
  }
}

/**
 * GET /api/admin/memberships
 * Obtiene todas las aplicaciones de membresía (solo administradores)
 */
async function handleGet(request: NextRequest) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const membershipType = searchParams.get('membershipType');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  
  // Construir filtros de MongoDB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mongoFilters: any = {};
  
  if (status && status !== 'all') {
    mongoFilters.status = status;
  }
  
  if (membershipType && membershipType !== 'all') {
    mongoFilters.membershipType = membershipType;
  }
  
  // Filtro de búsqueda por nombre, email o teléfono
  if (search) {
    mongoFilters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { motorcycleBrand: { $regex: search, $options: 'i' } },
      { motorcycleModel: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Definir el campo de ordenamiento
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortField: any = {};
  sortField[sortBy] = sortOrder;
  
  try {
    // Obtener aplicaciones con paginación
    const applications = await MembershipApplication.find(mongoFilters)
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .populate('reviewedBy', 'firstName lastName email')
      .populate('referredByMember', 'firstName lastName email')
      .select('-communicationHistory -userAgent -ipAddress') // Excluir campos sensibles
      .exec();
    
    const totalApplications = await MembershipApplication.countDocuments(mongoFilters);
    const totalPages = Math.ceil(totalApplications / limit);
    
    // Estadísticas adicionales
    const stats = await MembershipApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statistics = {
      total: totalApplications,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0
    };
    
    return createSuccessResponse({
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalApplications,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics
    });
    
  } catch (error) {
    console.error('Error fetching membership applications:', error);
    return createErrorResponse('Error al obtener solicitudes de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/memberships
 * Crea una nueva aplicación de membresía (solo administradores)
 */
async function handlePost(request: NextRequest) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  await connectDB();
  
  try {
    const body = await request.json();
    
    // Validaciones básicas
    if (!body.name?.trim()) {
      return createErrorResponse('El nombre es requerido', HTTP_STATUS.BAD_REQUEST);
    }
    
    if (!body.email?.trim()) {
      return createErrorResponse('El email es requerido', HTTP_STATUS.BAD_REQUEST);
    }
    
    if (!body.phone?.trim()) {
      return createErrorResponse('El teléfono es requerido', HTTP_STATUS.BAD_REQUEST);
    }
    
    if (!body.membershipType) {
      return createErrorResponse('El tipo de membresía es requerido', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Verificar si ya existe una aplicación con el mismo email
    const existingApplication = await MembershipApplication.findOne({ 
      email: body.email.toLowerCase() 
    });
    
    if (existingApplication) {
      return createErrorResponse('Ya existe una solicitud con este email', HTTP_STATUS.CONFLICT);
    }
    
    // Crear la nueva aplicación
    const applicationData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.trim(),
      membershipType: body.membershipType,
      message: body.message?.trim(),
      age: body.age,
      city: body.city?.trim(),
      motorcycleBrand: body.motorcycleBrand?.trim(),
      motorcycleModel: body.motorcycleModel?.trim(),
      ridingExperience: body.ridingExperience,
      referredBy: body.referredBy?.trim(),
      source: body.source || 'admin-panel',
      status: body.status || 'pending',
      isActive: true
    };
    
    const newApplication = new MembershipApplication(applicationData);
    await newApplication.save();
    
    // Poblar los campos de referencia para la respuesta
    await newApplication.populate('reviewedBy', 'firstName lastName email');
    await newApplication.populate('referredByMember', 'firstName lastName email');
    
    return createSuccessResponse({
      application: newApplication,
      message: 'Solicitud de membresía creada exitosamente'
    });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating membership application:', error);
    
    if (error.code === 11000) {
      return createErrorResponse('Ya existe una solicitud con este email', HTTP_STATUS.CONFLICT);
    }
    
    return createErrorResponse('Error al crear la solicitud de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Exportar los handlers con manejo de errores
export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
