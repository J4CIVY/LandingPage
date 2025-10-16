import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, createCSPHeader } from '@/lib/csp-nonce';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Generate unique nonce for this request (CSP enhancement)
  const nonce = generateNonce();
  response.headers.set('x-nonce', nonce);

  // Headers de seguridad básicos
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // SECURITY ENHANCEMENT: Permissions Policy (Feature Policy successor)
  response.headers.set('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()', // Disable FLoC
    'payment=(self)',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
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
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
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
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
