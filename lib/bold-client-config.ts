/**
 * Configuración de Bold para el lado del cliente
 * Este archivo solo contiene configuración segura para exponer en el navegador
 */

export const BOLD_CLIENT_CONFIG = {
  // API Key pública (segura para el cliente)
  // Fallback temporal hasta que se reinicie el servidor con las nuevas env vars
  PUBLIC_API_KEY: process.env.NEXT_PUBLIC_BOLD_API_KEY || '1Z1ONkdEjtHEoQ-69VWRVIwqSF8vapbwvp6Z7ehIFdI',
  
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
  const apiKey = BOLD_CLIENT_CONFIG.PUBLIC_API_KEY;
  
  console.log('Validating Bold client config:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE',
    environment: BOLD_CLIENT_CONFIG.ENVIRONMENT
  });
  
  if (!apiKey || apiKey.length < 20) {
    console.error('Bold API Key is missing or invalid. Make sure NEXT_PUBLIC_BOLD_API_KEY is set in .env.local');
    console.error('Current API Key:', apiKey || 'EMPTY');
    return false;
  }
  
  console.log('✓ Bold client config is valid');
  return true;
}
