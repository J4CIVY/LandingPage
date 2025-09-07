import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { getEmailService } from '@/lib/email-service';
import { contactEmailSchema } from '@/schemas/emailSchemas';
import { rateLimit } from '@/utils/rateLimit';

/**
 * POST /api/email/contact
 * Envía un correo electrónico desde el formulario de contacto
 */
async function handlePost(request: NextRequest) {
  // Configurar rate limiting para emails de contacto
  const rateLimiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 hora
    uniqueTokenPerInterval: 1000
  });

  try {
    // Obtener IP del cliente para rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Aplicar rate limiting (5 emails por hora por IP)
    await rateLimiter.check(clientIP, 5);

    // Validar el cuerpo de la solicitud
    const validation = await validateRequestBody(request, contactEmailSchema);
    if (!validation.success) {
      return validation.response;
    }

    const contactData = validation.data;

    const emailService = getEmailService();
    const emailSent = await emailService.sendContactEmail({
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
      category: contactData.category,
      priority: contactData.priority
    });

    if (!emailSent) {
      return createErrorResponse(
        'Error al enviar el correo electrónico',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return createSuccessResponse(
      { 
        message: 'Correo enviado exitosamente',
        messageId: `contact_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      'Mensaje enviado correctamente'
    );

  } catch (error: any) {
    console.error('Error sending contact email:', error);
    
    if (error.message === 'Rate limit exceeded') {
      return createErrorResponse(
        'Demasiadas solicitudes. Intenta más tarde.',
        429 // Too Many Requests
      );
    }

    return createErrorResponse(
      'Error interno del servidor',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const POST = withErrorHandling(handlePost);
