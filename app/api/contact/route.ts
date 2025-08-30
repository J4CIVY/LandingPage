import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
import { contactMessageSchema } from '@/lib/validation-schemas';

/**
 * GET /api/contact
 * Obtiene mensajes de contacto (solo para administradores)
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  
  // Construir filtros de MongoDB
  const mongoFilters: any = { isActive: true };
  
  if (status) {
    mongoFilters.status = status;
  }
  
  if (category) {
    mongoFilters.category = category;
  }
  
  if (priority) {
    mongoFilters.priority = priority;
  }
  
  // Calcular skip para paginación
  const skip = (page - 1) * limit;
  
  // Obtener mensajes con paginación
  const messages = await ContactMessage.find(mongoFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email')
    .exec();
  
  const totalMessages = await ContactMessage.countDocuments(mongoFilters);
  
  return createSuccessResponse({
    messages,
    pagination: {
      page,
      limit,
      total: totalMessages,
      pages: Math.ceil(totalMessages / limit)
    }
  }, 'Mensajes obtenidos exitosamente');
}

/**
 * POST /api/contact
 * Crea un nuevo mensaje de contacto
 */
async function handlePost(request: NextRequest) {
  await connectDB();
  
  const validation = await validateRequestBody(request, contactMessageSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const contactData = validation.data;
  
  try {
    // Obtener información adicional de la solicitud
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrerUrl = request.headers.get('referer') || '';
    
    // Crear nuevo mensaje de contacto
    const newMessage = new ContactMessage({
      ...contactData,
      ipAddress: clientIP,
      userAgent,
      referrerUrl,
      source: 'website'
    });
    
    await newMessage.save();
    
    // Retornar respuesta sin información sensible
    const responseData = {
      id: newMessage._id,
      name: newMessage.name,
      email: newMessage.email,
      subject: newMessage.subject,
      category: newMessage.category,
      status: newMessage.status,
      createdAt: newMessage.createdAt
    };
    
    return createSuccessResponse(
      responseData,
      'Mensaje enviado exitosamente. Te contactaremos pronto.',
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
