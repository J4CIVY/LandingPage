import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { getEmailService } from '@/lib/email-service';
import { notificationEmailSchema } from '@/schemas/emailSchemas';
import { requireAdmin } from '@/lib/auth-admin';

/**
 * POST /api/email/notifications
 * Envía notificaciones por correo electrónico
 * - welcome, password_reset: No requieren autenticación
 * - other types: Requieren autenticación de administrador
 */
async function handlePost(request: NextRequest) {
  // Validar el cuerpo de la solicitud primero
  const validation = await validateRequestBody(request, notificationEmailSchema);
  if (!validation.success) {
    return validation.response;
  }

  const notificationData = validation.data;

  // Solo requerir autenticación para tipos que no sean públicos
  const publicNotificationTypes = ['welcome', 'password_reset'];
  if (!publicNotificationTypes.includes(notificationData.type)) {
    const authResult = await requireAdmin(request as any);
    if (authResult) {
      return authResult; // Retorna el error de autenticación
    }
  }

  try {
    const emailService = getEmailService();
    let emailSent = false;

    switch (notificationData.type) {
      case 'welcome':
        emailSent = await emailService.sendWelcomeEmail(
          notificationData.recipientEmail,
          notificationData.recipientName,
          notificationData.templateData
        );
        break;

      case 'password_reset':
        if (!notificationData.templateData?.resetToken) {
          return createErrorResponse(
            'Token de restablecimiento requerido',
            HTTP_STATUS.BAD_REQUEST
          );
        }
        emailSent = await emailService.sendPasswordResetEmail(
          notificationData.recipientEmail,
          notificationData.recipientName,
          notificationData.templateData.resetToken
        );
        break;

      case 'event_reminder':
        if (!notificationData.templateData?.eventData) {
          return createErrorResponse(
            'Datos del evento requeridos',
            HTTP_STATUS.BAD_REQUEST
          );
        }
        emailSent = await emailService.sendEventNotification(
          notificationData.recipientEmail,
          notificationData.recipientName,
          notificationData.templateData.eventData
        );
        break;

      case 'membership_update':
        if (!notificationData.templateData?.membershipData) {
          return createErrorResponse(
            'Datos de membresía requeridos',
            HTTP_STATUS.BAD_REQUEST
          );
        }
        emailSent = await emailService.sendMembershipNotification(
          notificationData.recipientEmail,
          notificationData.recipientName,
          notificationData.templateData.membershipData
        );
        break;

      default:
        return createErrorResponse(
          'Tipo de notificación no válido',
          HTTP_STATUS.BAD_REQUEST
        );
    }

    if (!emailSent) {
      console.error('❌ Email notification failed:', {
        type: notificationData.type,
        recipient: notificationData.recipientEmail,
        timestamp: new Date().toISOString()
      });
      
      return createErrorResponse(
        'Error al enviar la notificación',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    console.log('✅ Email notification sent successfully:', {
      type: notificationData.type,
      recipient: notificationData.recipientEmail,
      timestamp: new Date().toISOString()
    });

    return createSuccessResponse(
      { 
        message: 'Notificación enviada exitosamente',
        type: notificationData.type,
        recipient: notificationData.recipientEmail,
        timestamp: new Date().toISOString()
      },
      'Notificación enviada correctamente'
    );

  } catch (error) {
    console.error('💥 Error sending notification email:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: notificationData?.type,
      recipient: notificationData?.recipientEmail,
      timestamp: new Date().toISOString()
    });
    
    return createErrorResponse(
      'Error interno del servidor',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const POST = withErrorHandling(handlePost);
