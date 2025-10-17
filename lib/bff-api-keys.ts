import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 * BFF (Backend for Frontend) API Key Management System
 * 
 * Este sistema protege las rutas API asegurando que SOLO el frontend autorizado
 * y los administradores autenticados puedan acceder a los endpoints.
 * 
 * Capas de seguridad:
 * 1. API Key: Para comunicación frontend-backend
 * 2. JWT Token: Para usuarios autenticados
 * 3. Role-based access: Solo admin puede acceder a ciertos endpoints
 */

// Validación crítica de seguridad
if (!process.env.BFF_API_KEY_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: BFF_API_KEY_SECRET must be defined in environment variables');
}

const BFF_API_KEY_SECRET = process.env.BFF_API_KEY_SECRET;
const BFF_API_KEY_HEADER = 'x-api-key';
const BFF_SIGNATURE_HEADER = 'x-api-signature';
const BFF_TIMESTAMP_HEADER = 'x-api-timestamp';

// API Keys permitidas (en producción, estas deberían estar en base de datos)
const VALID_API_KEYS = new Set([
  process.env.BFF_FRONTEND_API_KEY, // Frontend
  process.env.BFF_ADMIN_API_KEY,    // Admin panel
]);

export interface ApiKeyValidationResult {
  isValid: boolean;
  source?: 'frontend' | 'admin' | 'unknown';
  error?: string;
  timestamp?: number;
}

/**
 * Genera una API Key única y segura
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera una firma HMAC para una request
 */
export function generateSignature(
  apiKey: string,
  timestamp: number,
  method: string,
  path: string,
  body?: string
): string {
  const payload = `${apiKey}:${timestamp}:${method}:${path}:${body || ''}`;
  return crypto
    .createHmac('sha256', BFF_API_KEY_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Valida la firma de una request
 */
function validateSignature(
  apiKey: string,
  timestamp: number,
  signature: string,
  method: string,
  path: string,
  body?: string
): boolean {
  const expectedSignature = generateSignature(apiKey, timestamp, method, path, body);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Valida que el timestamp no sea muy antiguo (previene replay attacks)
 */
function validateTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutos
  
  return diff <= MAX_TIMESTAMP_DIFF;
}

/**
 * Identifica la fuente de la API Key
 */
function identifyApiKeySource(apiKey: string): 'frontend' | 'admin' | 'unknown' {
  if (apiKey === process.env.BFF_FRONTEND_API_KEY) {
    return 'frontend';
  }
  if (apiKey === process.env.BFF_ADMIN_API_KEY) {
    return 'admin';
  }
  return 'unknown';
}

/**
 * Valida la API Key de una request
 * 
 * Sistema de validación de 3 capas:
 * 1. Verifica que la API Key exista y sea válida
 * 2. Valida el timestamp para prevenir replay attacks
 * 3. Verifica la firma HMAC de la request
 */
export async function validateApiKey(
  request: NextRequest,
  requireSignature: boolean = true
): Promise<ApiKeyValidationResult> {
  try {
    // Extraer headers
    const apiKey = request.headers.get(BFF_API_KEY_HEADER);
    const signature = request.headers.get(BFF_SIGNATURE_HEADER);
    const timestampStr = request.headers.get(BFF_TIMESTAMP_HEADER);

    // Validar presencia de API Key
    if (!apiKey) {
      return {
        isValid: false,
        error: 'API Key no proporcionada. Acceso denegado.',
      };
    }

    // Validar que la API Key sea conocida
    if (!VALID_API_KEYS.has(apiKey)) {
      return {
        isValid: false,
        error: 'API Key inválida. Acceso denegado.',
      };
    }

    // Identificar fuente
    const source = identifyApiKeySource(apiKey);

    // Si se requiere firma (requests de modificación)
    if (requireSignature) {
      if (!signature || !timestampStr) {
        return {
          isValid: false,
          error: 'Firma o timestamp no proporcionados. Acceso denegado.',
        };
      }

      const timestamp = parseInt(timestampStr, 10);
      
      if (isNaN(timestamp)) {
        return {
          isValid: false,
          error: 'Timestamp inválido. Acceso denegado.',
        };
      }

      // Validar timestamp
      if (!validateTimestamp(timestamp)) {
        return {
          isValid: false,
          error: 'Timestamp expirado o inválido. Posible replay attack detectado.',
        };
      }

      // Obtener información de la request
      const method = request.method;
      const path = new URL(request.url).pathname;
      let body: string | undefined;

      // Para POST/PUT/PATCH, incluir el body en la firma
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          const clonedRequest = request.clone();
          const bodyText = await clonedRequest.text();
          body = bodyText;
        } catch (error) {
          // Si no se puede leer el body, continuar sin él
          body = undefined;
        }
      }

      // Validar firma
      if (!validateSignature(apiKey, timestamp, signature, method, path, body)) {
        return {
          isValid: false,
          error: 'Firma inválida. Acceso denegado.',
        };
      }

      return {
        isValid: true,
        source,
        timestamp,
      };
    }

    // Si no se requiere firma (solo API Key)
    return {
      isValid: true,
      source,
    };
  } catch (error) {
    console.error('Error validando API Key:', error);
    return {
      isValid: false,
      error: 'Error interno validando credenciales.',
    };
  }
}

/**
 * Valida que el request venga del frontend autorizado
 */
export async function isAuthorizedFrontend(request: NextRequest): Promise<boolean> {
  const result = await validateApiKey(request, false);
  return result.isValid && result.source === 'frontend';
}

/**
 * Valida que el request venga del admin panel
 */
export async function isAuthorizedAdmin(request: NextRequest): Promise<boolean> {
  const result = await validateApiKey(request, false);
  return result.isValid && result.source === 'admin';
}

/**
 * Middleware helper para validar API Key
 */
export function createApiKeyMiddleware(requireSignature: boolean = false) {
  return async (request: NextRequest): Promise<{ authorized: boolean; result: ApiKeyValidationResult }> => {
    const result = await validateApiKey(request, requireSignature);
    return {
      authorized: result.isValid,
      result,
    };
  };
}

/**
 * Genera headers para el cliente (frontend)
 */
export function generateClientHeaders(
  apiKey: string,
  method: string,
  path: string,
  body?: string
): Record<string, string> {
  const timestamp = Date.now();
  const signature = generateSignature(apiKey, timestamp, method, path, body);

  return {
    [BFF_API_KEY_HEADER]: apiKey,
    [BFF_SIGNATURE_HEADER]: signature,
    [BFF_TIMESTAMP_HEADER]: timestamp.toString(),
  };
}
