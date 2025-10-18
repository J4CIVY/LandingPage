/**
 * API Authentication Middleware - Sistema de autenticación robusto para proteger endpoints
 * 
 * SEGURIDAD CRÍTICA:
 * - Valida tokens JWT en todas las peticiones protegidas
 * - Verifica roles y permisos por endpoint
 * - Previene acceso no autorizado a datos sensibles
 * - Integra auditoría de seguridad
 * 
 * @author BSK Motorcycle Team - Security Team
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromRequest, JWTPayload } from '@/lib/auth-utils';
import { createErrorResponse, HTTP_STATUS } from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

/**
 * Roles del sistema y su jerarquía
 */
export enum UserRole {
  USER = 'user',
  VOLUNTEER = 'volunteer', 
  LEADER = 'leader',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super-admin'
}

/**
 * Jerarquía de roles (de mayor a menor privilegio)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.LEADER]: 3,
  [UserRole.VOLUNTEER]: 2,
  [UserRole.USER]: 1
};

/**
 * Resultado de autenticación
 */
export interface AuthContext {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    membershipType: string;
    sessionId: string;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Opciones de autenticación
 */
export interface AuthOptions {
  requiredRole?: UserRole;
  allowSelf?: boolean;
  checkSession?: boolean;
}

/**
 * Middleware principal de autenticación para APIs
 */
export async function authenticateApiRequest(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthContext> {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      await logUnauthorizedAccess(request, 'No token provided');
      return {
        isAuthenticated: false,
        error: 'Token de autenticación requerido. Por favor inicia sesión.',
        statusCode: HTTP_STATUS.UNAUTHORIZED
      };
    }

    let payload: JWTPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error: any) {
      await logUnauthorizedAccess(request, 'Invalid token: ' + error.message);
      return {
        isAuthenticated: false,
        error: error.message || 'Token inválido o expirado',
        statusCode: HTTP_STATUS.UNAUTHORIZED
      };
    }

    if (options.checkSession !== false) {
      await connectDB();
      
      const user: any = await User.findById(payload.userId)
        .select('sessions isActive role email membershipType')
        .lean();

      if (!user) {
        await logUnauthorizedAccess(request, 'User not found');
        return {
          isAuthenticated: false,
          error: 'Usuario no encontrado',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }

      if (user.isActive === false) {
        await logUnauthorizedAccess(request, 'User account disabled', payload.userId);
        return {
          isAuthenticated: false,
          error: 'Cuenta de usuario desactivada',
          statusCode: HTTP_STATUS.FORBIDDEN
        };
      }

      const session = user.sessions?.find(
        (s: any) => s.sessionId === payload.sessionId && s.isActive
      );

      if (!session) {
        await logUnauthorizedAccess(request, 'Session not found or inactive', payload.userId);
        return {
          isAuthenticated: false,
          error: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }
    }

    if (options.requiredRole) {
      const userRoleLevel = ROLE_HIERARCHY[payload.role as UserRole] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[options.requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        await logUnauthorizedAccess(
          request, 
          'Insufficient permissions. Required: ' + options.requiredRole + ', Has: ' + payload.role,
          payload.userId
        );
        return {
          isAuthenticated: false,
          error: 'Permisos insuficientes. Se requiere rol: ' + options.requiredRole,
          statusCode: HTTP_STATUS.FORBIDDEN
        };
      }
    }

    // 5. Registrar acceso exitoso (simplificado - comentado por ahora para evitar dependencias)
    // await ActivityLoggerService.logActivity({ ... });

    // ✅ Autenticación exitosa
    return {
      isAuthenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
        membershipType: payload.membershipType,
        sessionId: payload.sessionId
      }
    };

  } catch (error: any) {
    console.error('❌ Authentication Error:', error);
    return {
      isAuthenticated: false,
      error: 'Error al verificar autenticación',
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  return authenticateApiRequest(request, { checkSession: true });
}

export async function requireAdmin(request: NextRequest): Promise<AuthContext> {
  return authenticateApiRequest(request, { 
    requiredRole: UserRole.ADMIN,
    checkSession: true 
  });
}

export async function requireSuperAdmin(request: NextRequest): Promise<AuthContext> {
  return authenticateApiRequest(request, { 
    requiredRole: UserRole.SUPER_ADMIN,
    checkSession: true 
  });
}

export async function requireLeader(request: NextRequest): Promise<AuthContext> {
  return authenticateApiRequest(request, { 
    requiredRole: UserRole.LEADER,
    checkSession: true 
  });
}

export function canAccessUserResource(
  authContext: AuthContext,
  resourceUserId: string,
  allowSelf: boolean = true
): boolean {
  if (!authContext.isAuthenticated || !authContext.user) {
    return false;
  }

  if (allowSelf && authContext.user.id === resourceUserId) {
    return true;
  }

  const userRoleLevel = ROLE_HIERARCHY[authContext.user.role] || 0;
  const adminLevel = ROLE_HIERARCHY[UserRole.ADMIN];
  
  return userRoleLevel >= adminLevel;
}

export function createAuthErrorResponse(authContext: AuthContext): NextResponse {
  return NextResponse.json(
    createErrorResponse(
      authContext.error || 'No autorizado',
      authContext.statusCode || HTTP_STATUS.UNAUTHORIZED
    ),
    { status: authContext.statusCode || HTTP_STATUS.UNAUTHORIZED }
  );
}

async function logUnauthorizedAccess(
  request: NextRequest,
  reason: string,
  userId?: string
): Promise<void> {
  try {
    // Log básico en consola (se puede mejorar con sistema de logging completo)
    console.warn('🚨 SECURITY: Unauthorized access attempt', {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      reason,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Opcional: Registrar en base de datos si ActivityLoggerService está disponible
    // await ActivityLoggerService.logActivity({ ... });
  } catch (error) {
    console.error('❌ Error logging unauthorized access:', error);
  }
}

export function extractUserIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/api\/users\/([^\/]+)/);
  return match ? match[1] : null;
}

export const withAuth = authenticateApiRequest;

export {
  verifyAccessToken,
  extractTokenFromRequest
} from '@/lib/auth-utils';
