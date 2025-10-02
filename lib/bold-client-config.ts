/**
 * Configuración de Bold para el lado del cliente
 * Este archivo solo contiene configuración segura para exponer en el navegador
 */

export const BOLD_CLIENT_CONFIG = {
  // API Key pública (segura para el cliente)
  PUBLIC_API_KEY: process.env.NEXT_PUBLIC_BOLD_API_KEY || '',
  
  // URLs públicas
  CHECKOUT_SCRIPT_URL: 'https://checkout.bold.co/library/boldPaymentButton.js',
  
  // Configuración pública
  DEFAULT_CURRENCY: 'COP' as const,
  
  // Ambiente
  ENVIRONMENT: process.env.NEXT_PUBLIC_BOLD_ENVIRONMENT || 'production'
};

/**
 * Valida que la configuración del cliente esté completa
 */
export function validateBoldClientConfig(): boolean {
  if (!BOLD_CLIENT_CONFIG.PUBLIC_API_KEY) {
    console.error('Bold API Key is missing. Make sure NEXT_PUBLIC_BOLD_API_KEY is set in .env.local');
    return false;
  }
  return true;
}
