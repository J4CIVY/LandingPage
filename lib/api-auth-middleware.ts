import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, ApiKeyValidationResult } from './bff-api-keys';
import { verifyAccessToken, JWTPayload } from './auth-utils';

/**
 * Middleware de protección de API - BFF Pattern
 * 
 * Este middleware protege TODAS las rutas API garantizando que:
 * 1. Solo requests con API Key válida pueden acceder
 * 2. Usuarios deben estar autenticados (JWT válido)
 * 3. Solo administradores pueden acceder a rutas sensibles
 * 
 * SIN UNA API KEY VÁLIDA, NADIE PUEDE VER LOS DATOS
 * 
 * MODO TRANSICIÓN: Si las variables BFF no están configuradas en producción,
 * el sistema permitirá acceso solo con JWT válido (modo legacy)
 */

// Verificar si BFF está completamente configurado
const BFF_FULLY_CONFIGURED = !!(
  process.env.BFF_API_KEY_SECRET &&
  process.env.BFF_FRONTEND_API_KEY
);

// En desarrollo, mostrar advertencia si no está configurado
if (!BFF_FULLY_CONFIGURED && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  [BFF] Sistema BFF no completamente configurado');
  console.warn('   Funcionando en modo legacy (solo JWT)');
  console.warn('   Configura las variables BFF para máxima seguridad');
}

export interface ApiAuthContext {
  apiKeyValid: boolean;
  apiKeySource?: 'frontend' | 'admin' | 'unknown';
  authenticated: boolean;
  user?: JWTPayload;
  isAdmin: boolean;
}

/**
 * Lista de rutas que NO requieren autenticación (solo API Key)
 * Estas son rutas públicas que el frontend puede llamar sin login
 */
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
  '/api/auth/forgot-password',
  '/api/health',
  '/api/webhooks', // Webhooks tienen su propia validación
];

/**
 * Lista de rutas que REQUIEREN permisos de administrador
 */
const ADMIN_ONLY_ROUTES = [
  '/api/users',
  '/api/admin',
  '/api/membership/admin',
  '/api/leadership/admin',
  '/api/comunidad/reportes',
  '/api/analytics',
];

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

/**
 * Verifica si una ruta requiere permisos de administrador
 */
function isAdminOnlyRoute(path: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => path.startsWith(route));
}

/**
 * Extrae y valida el JWT token de la request
 */
async function extractAndValidateJWT(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Buscar token en Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAccessToken(token);
        return payload;
      } catch (error) {
        // Token inválido o expirado
      }
    }

    // Buscar token en cookies (múltiples formatos posibles)
    const cookieNames = ['bsk-access-token', 'auth-token', 'access-token'];
    for (const cookieName of cookieNames) {
      const cookieToken = request.cookies.get(cookieName)?.value;
      if (cookieToken) {
        try {
          const payload = verifyAccessToken(cookieToken);
          return payload;
        } catch (error) {
          // Token inválido o expirado, intentar siguiente cookie
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error validando JWT:', error);
    return null;
  }
}

/**
 * Crea una respuesta de error estandarizada
 */
function createUnauthorizedResponse(message: string, code: string = 'UNAUTHORIZED'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Crea una respuesta de error de permisos insuficientes
 */
function createForbiddenResponse(message: string = 'Permisos insuficientes'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

/**
 * Middleware principal de autenticación de API
 * 
 * Este middleware DEBE ser llamado en TODAS las rutas API
 * 
 * MODO TRANSICIÓN: Si BFF no está configurado, permite acceso con solo JWT
 */
export async function apiAuthMiddleware(
  request: NextRequest
): Promise<{ response?: NextResponse; context?: ApiAuthContext }> {
  const path = new URL(request.url).pathname;

  // PASO 1: Validar API Key (si está configurado)
  let apiKeyResult: ApiKeyValidationResult | null = null;
  let skipApiKeyValidation = false;

  if (BFF_FULLY_CONFIGURED) {
    // BFF completamente configurado - requerir API Key
    apiKeyResult = await validateApiKey(
      request,
      request.method !== 'GET' // Requerir firma para métodos que modifican datos
    );

    if (!apiKeyResult.isValid) {
      console.warn(`[BFF Security] API Key inválida para ${path}:`, apiKeyResult.error);
      return {
        response: createUnauthorizedResponse(
          'Acceso denegado: credenciales inválidas',
          'INVALID_API_KEY'
        ),
      };
    }
  } else {
    // BFF NO configurado - modo legacy (solo JWT)
    console.warn(`[BFF Legacy Mode] Acceso a ${path} sin validación de API Key`);
    skipApiKeyValidation = true;
    apiKeyResult = {
      isValid: true,
      source: 'frontend' as const,
    };
  }

  // PASO 2: Si es ruta pública, permitir acceso (pero ya validamos API Key si estaba configurado)
  if (isPublicRoute(path)) {
    return {
      context: {
        apiKeyValid: apiKeyResult?.isValid || false,
        apiKeySource: apiKeyResult?.source,
        authenticated: false,
        isAdmin: false,
      },
    };
  }

  // PASO 3: Para rutas protegidas, validar JWT
  const jwtPayload = await extractAndValidateJWT(request);

  if (!jwtPayload) {
    console.warn(`[BFF Security] JWT inválido o ausente para ${path}`);
    return {
      response: createUnauthorizedResponse(
        'Sesión inválida o expirada. Por favor, inicia sesión nuevamente.',
        'INVALID_SESSION'
      ),
    };
  }

  const isAdmin = jwtPayload.role === 'admin' || jwtPayload.role === 'superadmin';

  // PASO 4: Verificar permisos de administrador para rutas admin-only
  if (isAdminOnlyRoute(path) && !isAdmin) {
    console.warn(
      `[BFF Security] Usuario sin permisos de admin intentó acceder a ${path}:`,
      jwtPayload.email
    );
    return {
      response: createForbiddenResponse(
        'Esta funcionalidad está reservada para administradores'
      ),
    };
  }

  // PASO 5: Todo validado, permitir acceso
  return {
    context: {
      apiKeyValid: apiKeyResult?.isValid || false,
      apiKeySource: apiKeyResult?.source,
      authenticated: true,
      user: jwtPayload,
      isAdmin,
    },
  };
}

/**
 * Wrapper para proteger rutas API fácilmente
 * 
 * Uso:
 * export const GET = withApiProtection(async (request, context) => {
 *   // Tu código aquí
 *   // context.user tiene la info del usuario autenticado
 * });
 */
export function withApiProtection<T extends any[]>(
  handler: (request: NextRequest, context: ApiAuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Ejecutar middleware de autenticación
    const { response, context } = await apiAuthMiddleware(request);

    // Si hay una respuesta de error, retornarla
    if (response) {
      return response;
    }

    // Si no hay contexto (no debería pasar), error
    if (!context) {
      return createUnauthorizedResponse('Error de autenticación');
    }

    // Ejecutar el handler con el contexto
    try {
      return await handler(request, context, ...args);
    } catch (error) {
      console.error('[BFF Security] Error en handler protegido:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper específico para rutas que SOLO admin puede acceder
 */
export function withAdminProtection<T extends any[]>(
  handler: (request: NextRequest, context: ApiAuthContext, ...args: T) => Promise<NextResponse>
) {
  return withApiProtection(async (request: NextRequest, context: ApiAuthContext, ...args: T) => {
    if (!context.isAdmin) {
      return createForbiddenResponse('Esta funcionalidad está reservada para administradores');
    }
    return handler(request, context, ...args);
  });
}

/**
 * Helper para verificar permisos en handlers existentes
 */
export async function requireAuth(request: NextRequest): Promise<ApiAuthContext> {
  const { response, context } = await apiAuthMiddleware(request);
  
  if (response) {
    throw new Error('Unauthorized');
  }
  
  if (!context) {
    throw new Error('Authentication context missing');
  }
  
  return context;
}

/**
 * Helper para verificar que el usuario sea admin
 */
export async function requireAdmin(request: NextRequest): Promise<ApiAuthContext> {
  const context = await requireAuth(request);
  
  if (!context.isAdmin) {
    throw new Error('Admin privileges required');
  }
  
  return context;
}
