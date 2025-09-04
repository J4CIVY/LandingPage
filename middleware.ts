import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Headers de seguridad básicos
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Proteger rutas de administración
  if (pathname.startsWith('/admin')) {
    try {
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        console.log('[MIDDLEWARE] Sin token para ruta admin:', pathname);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Para rutas de admin, verificar que el usuario tenga rol de admin
      if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
        console.log('[MIDDLEWARE] Usuario sin permisos de admin:', decoded.role);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      console.log('[MIDDLEWARE] Acceso admin autorizado:', pathname, 'Rol:', decoded.role);
      
    } catch (error) {
      console.log('[MIDDLEWARE] Error verificando token admin:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger otras rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/events/register', '/membership-info'];
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        console.log('[MIDDLEWARE] Sin token para ruta protegida:', pathname);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      jwt.verify(token, process.env.JWT_SECRET!);
      console.log('[MIDDLEWARE] Acceso autorizado a ruta protegida:', pathname);
      
    } catch (error) {
      console.log('[MIDDLEWARE] Error verificando token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
