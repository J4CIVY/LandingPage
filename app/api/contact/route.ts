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
import { contactMessageSchema, paginationSchema } from '@/lib/validation-schemas';

/**
 * GET /api/contact
 * Obtiene mensajes de contacto con paginación
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
  const status = queryParams.status as 'new' | 'in-progress' | 'resolved' | 'closed' | undefined;
  const type = queryParams.type as 'general' | 'membership' | 'technical' | 'complaint' | 'suggestion' | undefined;
  
  // Obtener todos los mensajes
  let messages = db.getAllContactMessages();
  
  // Aplicar filtros
  if (status) {
    messages = messages.filter(msg => msg.status === status);
  }
  
  if (type) {
    messages = messages.filter(msg => msg.type === type);
  }
  
  // Ordenar por fecha de creación (más recientes primero)
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Aplicar paginación
  const total = messages.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMessages = messages.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    messages: paginatedMessages,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    stats: {
      new: messages.filter(msg => msg.status === 'new').length,
      inProgress: messages.filter(msg => msg.status === 'in-progress').length,
      resolved: messages.filter(msg => msg.status === 'resolved').length,
      closed: messages.filter(msg => msg.status === 'closed').length,
      total: messages.length
    }
  }, 'Mensajes de contacto obtenidos exitosamente');
}

/**
 * POST /api/contact
 * Crea un nuevo mensaje de contacto
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, contactMessageSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const messageData = validation.data;
  
  const newMessage = db.createContactMessage({
    ...messageData,
    status: 'new'
  });
  
  // Simular notificación al equipo de soporte
  console.log(`📧 NUEVO MENSAJE DE CONTACTO: ${newMessage.type.toUpperCase()}`);
  console.log(`📋 Asunto: ${newMessage.subject}`);
  console.log(`👤 Remitente: ${newMessage.name} (${newMessage.email})`);
  
  // Simular auto-respuesta
  console.log(`🤖 Auto-respuesta enviada a ${newMessage.email}`);
  
  return createSuccessResponse(
    { 
      message: newMessage,
      confirmationMessage: 'Tu mensaje ha sido recibido. Te responderemos en un plazo de 24-48 horas.'
    },
    'Mensaje de contacto enviado exitosamente',
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
