/**
 * Utilidades para el sistema de autenticación 2FA
 */

/**
 * Genera un código OTP alfanumérico de 6 dígitos
 * Usa caracteres A-Z y 0-9 excluyendo caracteres ambiguos (0, O, I, 1, l)
 */
export function generateOTPCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin 0, O, I, 1
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Obtiene la fecha de expiración del código OTP (5 minutos desde ahora)
 */
export function getOTPExpirationDate(): Date {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
}

/**
 * Formatea el número de WhatsApp para el formato internacional
 * Ejemplo: "3001234567" -> "+573001234567"
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remover espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Si ya tiene +, devolverlo tal cual
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Si empieza con 57 (código de Colombia), agregar +
  if (cleaned.startsWith('57') && cleaned.length > 10) {
    return '+' + cleaned;
  }
  
  // Si es un número colombiano de 10 dígitos, agregar +57
  if (cleaned.length === 10) {
    return '+57' + cleaned;
  }
  
  // Por defecto, agregar + al inicio
  return '+' + cleaned;
}

/**
 * Envía el código OTP al webhook de MessageBird
 */
export async function sendOTPToMessageBird(
  code: string,
  whatsappNumber: string,
  userEmail: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04';
    
    // Formatear el número de WhatsApp
    const formattedNumber = formatWhatsAppNumber(whatsappNumber);
    
    // Payload para MessageBird
    const payload = {
      otp: code,
      phoneNumber: formattedNumber,
      email: userEmail,
      name: userName,
      timestamp: new Date().toISOString()
    };
    
    console.log('Enviando OTP a MessageBird:', {
      phoneNumber: formattedNumber,
      code: code.substring(0, 2) + '****' // Log parcial por seguridad
    });
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al enviar OTP a MessageBird:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        success: false,
        error: `Error al enviar código: ${response.statusText}`
      };
    }
    
    console.log('OTP enviado exitosamente a MessageBird');
    
    return { success: true };
    
  } catch (error) {
    console.error('Error al enviar OTP a MessageBird:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Valida el formato del código OTP
 */
export function isValidOTPFormat(code: string): boolean {
  // Debe ser exactamente 6 caracteres alfanuméricos
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}
