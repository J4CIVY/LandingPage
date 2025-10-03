/**
 * Servicio de integración con Bird CRM para notificaciones de WhatsApp
 */

const BIRD_WEBHOOK_URL = 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/54e5187d-ba66-415e-b022-de57b76e50a5';

export interface EventRegistrationNotification {
  nombreMiembro: string;
  nombreEvento: string;
  fechaEvento: string;
  lugarEvento: string;
  valorPagado: string;
  urlFactura: string;
  telefonoMiembro: string;
}

/**
 * Envía notificación de registro de evento a través de Bird CRM
 */
export async function sendEventRegistrationNotification(
  data: EventRegistrationNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Enviando notificación a Bird CRM:', data);

    const response = await fetch(BIRD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreMiembro: data.nombreMiembro,
        nombreEvento: data.nombreEvento,
        fechaEvento: data.fechaEvento,
        lugarEvento: data.lugarEvento,
        valorPagado: data.valorPagado,
        urlFactura: data.urlFactura,
        telefonoMiembro: data.telefonoMiembro,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al enviar notificación a Bird CRM:', errorText);
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${errorText}`
      };
    }

    console.log('Notificación enviada exitosamente a Bird CRM');
    return { success: true };

  } catch (error: any) {
    console.error('Error al enviar notificación a Bird CRM:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}

/**
 * Formatea la fecha del evento para el mensaje de WhatsApp
 */
export function formatEventDate(date: Date | string): string {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea el valor del pago para el mensaje de WhatsApp
 */
export function formatPaymentAmount(amount: number, currency: string = 'COP'): string {
  return `$${amount.toLocaleString('es-CO')} ${currency}`;
}

/**
 * Genera la URL de la factura para un pago específico
 */
export function generateInvoiceUrl(transactionId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com';
  return `${base}/api/bold/transactions/${transactionId}/invoice`;
}
