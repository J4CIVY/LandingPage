import { NextRequest, NextResponse } from 'next/server';

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

  // Proteger rutas de administración - verificación básica de token
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      console.log('[MIDDLEWARE] Sin token para ruta admin:', pathname);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificación básica de formato de token (sin JWT decode por Edge Runtime)
    // La verificación completa de rol se hará en las APIs individuales
    if (!token.includes('.') || token.length < 50) {
      console.log('[MIDDLEWARE] Token inválido para ruta admin:', pathname);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('[MIDDLEWARE] Token presente para ruta admin:', pathname);
  }

  // Proteger otras rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/events/register'];
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      console.log('[MIDDLEWARE] Sin token para ruta protegida:', pathname);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('[MIDDLEWARE] Token presente para ruta protegida:', pathname);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
