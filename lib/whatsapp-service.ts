/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

// Schema para validar los datos que se envían al webhook
const whatsappNotificationSchema = z.object({
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido'),
  whatsapp: z.string().min(1, 'Número de WhatsApp requerido'),
  membershipType: z.string().min(1, 'Tipo de membresía requerido')
});

export type WhatsAppNotificationData = z.infer<typeof whatsappNotificationSchema>;

export class WhatsAppService {
  private readonly webhookUrl = 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/a071d5c3-9566-471d-8cb0-057c6e222da3';

  /**
   * Envía notificación de bienvenida por WhatsApp
   * @param data Datos del usuario para la notificación
   */
  async sendWelcomeNotification(data: WhatsAppNotificationData): Promise<void> {
    try {
      // Validar los datos antes de enviar
      const validatedData = whatsappNotificationSchema.parse(data);

      console.log('📱 Enviando notificación de WhatsApp:', {
        documentNumber: validatedData.documentNumber,
        firstName: validatedData.firstName,
        whatsapp: validatedData.whatsapp,
        membershipType: validatedData.membershipType
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        return;
      }

      console.log('✅ Notificación de WhatsApp enviada exitosamente');

      // Intentar parsear la respuesta si existe
      try {
        const responseData = await response.json();
        console.log('📱 Respuesta del webhook:', responseData);
      } catch (parseError) {
        // Si no se puede parsear la respuesta, no es un error crítico
        console.log('📱 Notificación enviada, respuesta no JSON');
      }

    } catch (error) {
      console.error('❌ Error enviando notificación de WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Envía notificación de bienvenida de forma segura (no lanza errores)
   * @param data Datos del usuario para la notificación
   * @returns Promise que se resuelve sin importar el resultado
   */
  async sendWelcomeNotificationSafe(data: WhatsAppNotificationData): Promise<boolean> {
    try {
      await this.sendWelcomeNotification(data);
      return true;
    } catch (error) {
      console.error('⚠️ Error enviando notificación de WhatsApp (modo seguro):', error);
      return false;
    }
  }
}

// Función helper para uso directo
export async function sendWhatsAppWelcomeNotification(
  documentNumber: string,
  firstName: string,
  whatsapp: string,
  membershipType: string
): Promise<boolean> {
  const whatsappService = new WhatsAppService();
  return await whatsappService.sendWelcomeNotificationSafe({
    documentNumber,
    firstName,
    whatsapp,
    membershipType
  });
}
