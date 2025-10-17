import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import connectDB from './mongodb';
import User from './models/User';

// Configuración de JWT
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables. Never use default secrets in production.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  membershipType: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success: boolean;
  isValid: boolean;
  session?: {
    userId: string;
    sessionId: string;
  };
  user?: {
    id: string;
    email: string;
    membershipType: string;
    role: string;
  };
  error?: string;
}

/**
 * Genera un token JWT
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'bsk-motorcycle-team',
    audience: 'bsk-mt-users'
  });
}

/**
 * Genera un refresh token
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'bsk-motorcycle-team',
    audience: 'bsk-mt-refresh'
  });
}

/**
 * Verifica un token JWT
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'bsk-motorcycle-team',
      audience: 'bsk-mt-users'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Error al verificar token');
  }
}

/**
 * Verifica un refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'bsk-motorcycle-team',
      audience: 'bsk-mt-refresh'
    }) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Refresh token inválido');
    }
    throw new Error('Error al verificar refresh token');
  }
}

/**
 * Genera un token seguro aleatorio
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un hash seguro para tokens
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Extrae información del dispositivo de la request
 */
export function extractDeviceInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';

  // Parsing básico del user agent
  let device = 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';

  if (userAgent) {
    // Detectar dispositivo
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      device = 'Mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Desktop';
    }

    // Detectar browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detectar OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
  }

  return {
    userAgent,
    ip: Array.isArray(ip) ? ip[0] : ip,
    device,
    browser,
    os
  };
}

/**
 * Calcula la fecha de expiración para sesiones
 */
export function getSessionExpirationDate(): Date {
  const expirationTime = JWT_REFRESH_EXPIRES_IN;
  let milliseconds = 7 * 24 * 60 * 60 * 1000; // 7 días por defecto

  if (expirationTime.endsWith('d')) {
    const days = parseInt(expirationTime.slice(0, -1));
    milliseconds = days * 24 * 60 * 60 * 1000;
  } else if (expirationTime.endsWith('h')) {
    const hours = parseInt(expirationTime.slice(0, -1));
    milliseconds = hours * 60 * 60 * 1000;
  } else if (expirationTime.endsWith('m')) {
    const minutes = parseInt(expirationTime.slice(0, -1));
    milliseconds = minutes * 60 * 1000;
  }

  return new Date(Date.now() + milliseconds);
}

/**
 * Extrae el token de la request (header Authorization o cookies)
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Intentar extraer del header Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Intentar extraer de cookies
  const token = request.cookies.get('bsk-access-token')?.value;
  return token || null;
}

/**
 * Valida el formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida la fortaleza de la contraseña
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifica la autenticación del usuario desde la request
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Extraer token del header o cookies
    let token = extractTokenFromRequest(request);
    
    if (!token) {
      // Intentar obtener de cookies con el nombre correcto
      const cookies = request.cookies;
      token = cookies.get('bsk-access-token')?.value || null;
    }

    if (!token) {
      return {
        success: false,
        isValid: false,
        error: 'Token de autenticación no encontrado'
      };
    }

    // Verificar el token
    const payload = verifyAccessToken(token);
    
    // Conectar a la base de datos y verificar que el usuario existe
    await connectDB();
    const user = await User.findById(payload.userId).select('email membershipType role isActive');
    
    if (!user || !user.isActive) {
      return {
        success: false,
        isValid: false,
        error: 'Usuario no encontrado o inactivo'
      };
    }

    return {
      success: true,
      isValid: true,
      session: {
        userId: payload.userId,
        sessionId: payload.sessionId
      },
      user: {
        id: payload.userId,
        email: user.email,
        membershipType: user.membershipType,
        role: user.role || 'user'
      }
    };

  } catch (error: any) {
    // SECURITY: Never log detailed authentication errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth verification error:', error.message);
    }
    return {
      success: false,
      isValid: false,
      error: 'Error de autenticación'
    };
  }
}

// Alias para compatibilidad con código existente
export { verifyAuth as verifySession };

/**
 * NUEVA FUNCIÓN: Require Authentication - Middleware para proteger rutas
 * Retorna NextResponse con error 401 si no está autenticado
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.isValid) {
    return authResult;
  }
  
  return authResult;
}

/**
 * NUEVA FUNCIÓN: Require Admin - Verifica que el usuario tenga rol de administrador
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success || !authResult.isValid) {
    return authResult;
  }
  
  // Verificar que el usuario sea admin
  if (authResult.user?.role !== 'admin') {
    return {
      success: false,
      isValid: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    };
  }
  
  return authResult;
}

/**
 * NUEVA FUNCIÓN: Require Self or Admin - Verifica que el usuario acceda a sus propios datos o sea admin
 */
export async function requireSelfOrAdmin(request: NextRequest, targetUserId: string): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success || !authResult.isValid) {
    return authResult;
  }
  
  // Permitir si es el mismo usuario o es admin
  const isSelf = authResult.user?.id === targetUserId;
  const isAdmin = authResult.user?.role === 'admin';
  
  if (!isSelf && !isAdmin) {
    return {
      success: false,
      isValid: false,
      error: 'Acceso denegado. Solo puedes acceder a tus propios datos'
    };
  }
  
  return authResult;
}
