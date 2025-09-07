import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { getEmailService } from '@/lib/email-service';
import { requireAdmin } from '@/lib/auth-admin';

/**
 * POST /api/email/test
 * Envía un correo de prueba (solo para administradores)
 */
async function handlePost(request: NextRequest) {
  // Verificar autenticación de administrador
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    const { testEmail, testType = 'basic' } = await request.json();

    if (!testEmail) {
      return createErrorResponse(
        'Email de prueba requerido',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const emailService = getEmailService();
    let emailSent = false;

    switch (testType) {
      case 'basic':
        emailSent = await emailService.sendAdminNotification(
          'Correo de prueba - BSK Motorcycle Team',
          `
Este es un correo de prueba enviado desde el sistema BSK Motorcycle Team.

Si recibes este mensaje, significa que la configuración de correo está funcionando correctamente.

Información de la prueba:
- Fecha: ${new Date().toLocaleString('es-ES')}
- Destinatario: ${testEmail}
- Sistema: Zoho Mail API
- Entorno: ${process.env.NODE_ENV || 'development'}

¡Configuración exitosa!
          `,
          'medium'
        );
        break;

      case 'welcome':
        emailSent = await emailService.sendWelcomeEmail(
          testEmail,
          'Usuario de Prueba'
        );
        break;

      case 'contact':
        emailSent = await emailService.sendContactEmail({
          name: 'Usuario de Prueba',
          email: testEmail,
          subject: 'Mensaje de prueba del formulario de contacto',
          message: 'Este es un mensaje de prueba enviado desde el sistema de correo.',
          category: 'general',
          priority: 'medium'
        });
        break;

      case 'event':
        emailSent = await emailService.sendEventNotification(
          testEmail,
          'Usuario de Prueba',
          {
            title: 'Evento de Prueba',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            location: 'Ubicación de Prueba',
            description: 'Este es un evento de prueba para verificar las notificaciones por correo.'
          }
        );
        break;

      default:
        return createErrorResponse(
          'Tipo de prueba no válido',
          HTTP_STATUS.BAD_REQUEST
        );
    }

    if (!emailSent) {
      return createErrorResponse(
        'Error al enviar el correo de prueba',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return createSuccessResponse(
      { 
        message: 'Correo de prueba enviado exitosamente',
        testType,
        recipient: testEmail,
        timestamp: new Date().toISOString()
      },
      'Correo de prueba enviado'
    );

  } catch (error) {
    console.error('Error sending test email:', error);
    return createErrorResponse(
      'Error al enviar correo de prueba',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const POST = withErrorHandling(handlePost);
