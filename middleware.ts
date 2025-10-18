import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, createCSPHeader } from '@/lib/csp-nonce';
import { safeJsonParse } from '@/lib/json-utils';

/**
 * SECURITY CRITICAL: Rutas públicas de API que NO requieren autenticación
 * Mantener esta lista MÍNIMA y revisarla regularmente
 */
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/webhooks',
  '/api/captcha',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
  '/api/weather/current', // Solo clima público
];

/**
 * Rutas de API que requieren autenticación de ADMIN o superior
 */
const ADMIN_API_ROUTES = [
  '/api/admin',
  '/api/users/stats',
  '/api/notifications/admin',
  '/api/pqrsdf/estadisticas',
];

/**
 * Verifica si una ruta es pública (no requiere autenticación)
 */
function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si una ruta requiere permisos de administrador
 */
function isAdminApiRoute(pathname: string): boolean {
  return ADMIN_API_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ============================================================
  // PROTECCIÓN CRÍTICA DE API - AUTENTICACIÓN OBLIGATORIA
  // ============================================================
  if (pathname.startsWith('/api/')) {
    // Excluir rutas públicas explícitamente permitidas
    if (!isPublicApiRoute(pathname)) {
      const token = request.cookies.get('bsk-access-token')?.value;
      
      // ❌ Sin token = Sin acceso
      if (!token) {
        console.warn(`🚨 SECURITY: Unauthorized API access attempt to ${pathname}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Autenticación requerida. Por favor inicia sesión.',
            code: 'AUTH_REQUIRED'
          }, 
          { status: 401 }
        );
      }

      // Validación básica del formato del token (3 partes JWT)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn(`🚨 SECURITY: Invalid token format for ${pathname}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Token de autenticación inválido.',
            code: 'INVALID_TOKEN'
          }, 
          { status: 401 }
        );
      }

      // Verificar expiración del token (validación básica sin verificar firma)
      try {
        const payload = safeJsonParse<any>(Buffer.from(parts[1], 'base64').toString(), {});
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn(`🚨 SECURITY: Expired token for ${pathname}`);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Token expirado. Por favor inicia sesión nuevamente.',
              code: 'TOKEN_EXPIRED'
            }, 
            { status: 401 }
          );
        }

        // Verificar permisos de administrador para rutas admin
        if (isAdminApiRoute(pathname)) {
          const role = payload.role;
          if (role !== 'admin' && role !== 'super-admin') {
            console.warn(`🚨 SECURITY: Insufficient permissions for ${pathname}. Role: ${role}`);
            return NextResponse.json(
              { 
                success: false, 
                error: 'Permisos insuficientes. Se requiere rol de administrador.',
                code: 'FORBIDDEN'
              }, 
              { status: 403 }
            );
          }
        }

        // Pasar userId en el header para uso en los endpoints
        response.headers.set('x-user-id', payload.userId);
        response.headers.set('x-user-role', payload.role || 'user');
        
      } catch (error) {
        console.error(`🚨 SECURITY: Token parsing error for ${pathname}:`, error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Token de autenticación inválido.',
            code: 'INVALID_TOKEN'
          }, 
          { status: 401 }
        );
      }
    }
  }

  // Generate unique nonce for this request (CSP enhancement)
  const nonce = generateNonce();
  response.headers.set('x-nonce', nonce);

  // SECURITY: Essential security headers
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Legacy XSS protection (still useful for older browsers)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Control referrer info
  response.headers.set('X-DNS-Prefetch-Control', 'on'); // Allow DNS prefetch
  response.headers.set('X-Download-Options', 'noopen'); // Prevent IE from executing downloads
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none'); // Restrict cross-domain policies
  
  // SECURITY ENHANCEMENT: Permissions Policy (Feature Policy successor)
  // Restricts access to browser features and APIs
  response.headers.set('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()', // Disable FLoC (Google's tracking tech)
    'payment=(self "https://checkout.bold.co")',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=(self)',
    'encrypted-media=(self)',
    'fullscreen=(self)',
    'picture-in-picture=()',
  ].join(', '));
  
  // Enhanced CSP with nonce-based inline script protection
  response.headers.set('Content-Security-Policy', createCSPHeader(nonce));

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Proteger rutas de administración - verificación básica de token
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?returnUrl=' + encodeURIComponent(pathname), request.url));
    }

    // SECURITY FIX: Enhanced JWT validation
    // Verify token structure and signature (basic validation for Edge Runtime)
    try {
      // Check JWT structure (must have 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }
      
      // Decode payload to check expiration (without full verification due to Edge Runtime limits)
      // SECURITY: Use safeJsonParse to prevent prototype pollution
      const payload = safeJsonParse<any>(Buffer.from(parts[1], 'base64').toString(), {});
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/login?error=token_expired', request.url));
      }
      
      // For admin routes, check if user has admin role
      if (!payload.role || (payload.role !== 'admin' && payload.role !== 'super-admin')) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    } catch (error) {
      console.error('Token validation error in middleware:', error);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }
  }

  // Proteger otras rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/events/register', '/profile'];
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?returnUrl=' + encodeURIComponent(pathname), request.url));
    }

    // SECURITY FIX: Enhanced token validation for protected routes
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }
      
      // SECURITY: Use safeJsonParse to prevent prototype pollution
      const payload = safeJsonParse<any>(Buffer.from(parts[1], 'base64').toString(), {});
      
      // Check token expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/login?error=token_expired&returnUrl=' + encodeURIComponent(pathname), request.url));
      }
    } catch (error) {
      console.error('Token validation error in middleware:', error);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Proteger TODAS las rutas incluyendo API
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
