import crypto from 'crypto';

/**
 * Configuración de Bold
 */
export const BOLD_CONFIG = {
  // Llaves de integración (usar variables de entorno)
  API_KEY: process.env.BOLD_API_KEY || '',
  SECRET_KEY: process.env.BOLD_SECRET_KEY || '',
  
  // URLs
  CHECKOUT_SCRIPT_URL: 'https://checkout.bold.co/library/boldPaymentButton.js',
  API_BASE_URL: 'https://payments.api.bold.co/v2',
  
  // Configuración
  DEFAULT_CURRENCY: 'COP' as const,
  DEFAULT_TAX_TYPE: 'vat-19' as const, // IVA 19%
  
  // Ambiente (production o sandbox)
  ENVIRONMENT: process.env.BOLD_ENVIRONMENT || 'sandbox'
};

/**
 * Tipos de impuestos permitidos por Bold
 */
export type BoldTaxType = 'vat-5' | 'vat-19' | 'iac-8' | 'consumption';

/**
 * Interfaz para la configuración de un pago Bold
 */
export interface BoldPaymentConfig {
  orderId: string;
  amount: number; // En centavos (ej: 10000 = $10.000 COP)
  currency?: 'COP' | 'USD';
  description: string;
  tax?: BoldTaxType | number | Record<string, number>;
  redirectionUrl?: string;
  originUrl?: string;
  expirationDate?: number; // Timestamp en nanosegundos
  customerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
    dialCode?: string;
    documentNumber?: string;
    documentType?: 'CC' | 'CE' | 'PA' | 'NIT' | 'TI';
  };
  billingAddress?: {
    address?: string;
    city?: string;
    zipCode?: string;
    state?: string;
    country?: string; // Código de 2 dígitos (ej: "CO")
  };
  extraData1?: string;
  extraData2?: string;
}

/**
 * Estados de transacción de Bold
 */
export enum BoldTransactionStatus {
  PROCESSING = 'PROCESSING',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  NO_TRANSACTION_FOUND = 'NO_TRANSACTION_FOUND'
}

/**
 * Métodos de pago de Bold
 */
export enum BoldPaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PSE = 'PSE',
  NEQUI = 'NEQUI',
  BANCOLOMBIA_BUTTON = 'BANCOLOMBIA_BUTTON',
  CASH = 'CASH'
}

/**
 * Genera el hash de integridad para una transacción Bold
 * 
 * @param orderId - Identificador único de la orden
 * @param amount - Monto de la transacción (en centavos, sin decimales)
 * @param currency - Divisa (COP o USD)
 * @param secretKey - Llave secreta de Bold (opcional, usa la del env por defecto)
 * @returns Hash SHA256 en formato hexadecimal
 */
export function generateBoldIntegrityHash(
  orderId: string,
  amount: number,
  currency: 'COP' | 'USD' = 'COP',
  secretKey?: string
): string {
  const key = secretKey || BOLD_CONFIG.SECRET_KEY;
  
  if (!key) {
    throw new Error('Bold secret key is not configured');
  }

  // Concatenar: {orderId}{amount}{currency}{secretKey}
  const concatenatedString = `${orderId}${amount}${currency}${key}`;
  
  // Generar hash SHA256
  const hash = crypto
    .createHash('sha256')
    .update(concatenatedString)
    .digest('hex');

  return hash;
}

/**
 * Valida que una configuración de pago Bold sea correcta
 * 
 * @param config - Configuración del pago
 * @returns true si es válida, lanza error si no lo es
 */
export function validateBoldPaymentConfig(config: BoldPaymentConfig): boolean {
  // Validar orden ID
  if (!config.orderId || config.orderId.length > 60) {
    throw new Error('Order ID is required and must be less than 60 characters');
  }

  // Validar caracteres del orden ID
  const validOrderIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validOrderIdRegex.test(config.orderId)) {
    throw new Error('Order ID can only contain alphanumeric characters, underscores and hyphens');
  }

  // Validar monto
  if (config.amount < 1000) {
    throw new Error('Amount must be at least 1000 COP (minimum allowed by Bold)');
  }

  // Validar descripción
  if (!config.description || config.description.length < 2 || config.description.length > 100) {
    throw new Error('Description is required and must be between 2 and 100 characters');
  }

  // Validar que no contenga URLs en la descripción
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (urlRegex.test(config.description)) {
    throw new Error('Description cannot contain URLs');
  }

  return true;
}

/**
 * Genera un identificador único para una orden Bold
 * Formato: PREFIX-TIMESTAMP-RANDOM
 * 
 * @param prefix - Prefijo para el identificador (ej: "EVT", "MEM")
 * @returns Identificador único
 */
export function generateBoldOrderId(prefix: string = 'BSK'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Formatea un monto para Bold (sin decimales, en centavos)
 * 
 * @param amount - Monto en pesos (ej: 50000.50)
 * @returns Monto en centavos sin decimales (ej: 50001)
 */
export function formatBoldAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Calcula el impuesto sobre un monto
 * 
 * @param amount - Monto total (con impuesto incluido)
 * @param taxRate - Tasa de impuesto (ej: 19 para 19%)
 * @returns Valor del impuesto
 */
export function calculateTaxAmount(amount: number, taxRate: number): number {
  // El impuesto está incluido en el monto
  // Base gravable = monto / (1 + tasa/100)
  // Impuesto = monto - base gravable
  const baseAmount = amount / (1 + taxRate / 100);
  const taxAmount = amount - baseAmount;
  return Math.round(taxAmount);
}

/**
 * Calcula la fecha de expiración para un pago Bold
 * 
 * @param hoursFromNow - Horas desde ahora (por defecto 24)
 * @returns Timestamp en nanosegundos
 */
export function calculateBoldExpirationDate(hoursFromNow: number = 24): number {
  const now = Date.now();
  const expirationMs = now + (hoursFromNow * 60 * 60 * 1000);
  // Bold requiere nanosegundos
  return expirationMs * 1000000;
}

/**
 * Verifica si una llave de Bold es válida
 * 
 * @param apiKey - Llave de identidad
 * @returns true si la llave parece válida
 */
export function isValidBoldApiKey(apiKey: string): boolean {
  // Las llaves de Bold suelen tener un formato específico
  return apiKey.length > 20 && /^[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Obtiene la URL base según el ambiente
 * 
 * @returns URL base de la aplicación
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En servidor
  return process.env.NEXT_PUBLIC_APP_URL || 'https://bskmt.com';
}

/**
 * Genera las URLs de redirección para Bold
 * 
 * @param eventId - ID del evento
 * @param orderId - ID de la orden
 * @returns URLs de redirección y origen
 */
export function generateBoldRedirectUrls(eventId: string, orderId: string) {
  const baseUrl = getBaseUrl();
  
  return {
    redirectionUrl: `${baseUrl}/events/${eventId}/payment-result?orderId=${orderId}`,
    originUrl: `${baseUrl}/events/${eventId}`
  };
}
