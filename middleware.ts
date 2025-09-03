import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-utils';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin'
];

// Rutas que NO deben ser accesibles para usuarios autenticados
const authRoutes = [
  '/login',
  '/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const userAgent = request.headers.get('user-agent') || '';

  // Enhanced security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Block malicious requests
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /acunetix/i,
    /w3af/i,
    /burp/i,
    /python-requests/i,
    /curl/i,
    /wget/i,
  ];
  
  // Allow legitimate bots
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !isLegitimate) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block requests with suspicious query parameters
  const url = request.nextUrl;
  const suspiciousQueries = [
    'script',
    'javascript',
    'vbscript',
    'onload',
    'onerror',
    'eval',
    'expression',
    'union',
    'select',
    'insert',
    'update',
    'delete',
    'drop',
    'create',
    'alter',
    '../',
    './',
    'etc/passwd',
    'cmd.exe',
    'powershell',
  ];
  
  for (const [key, value] of url.searchParams) {
    const queryString = `${key}=${value}`.toLowerCase();
    if (suspiciousQueries.some(pattern => queryString.includes(pattern))) {
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');

  // Manejar archivos estáticos con optimizaciones de cache
  if (pathname.endsWith('.css')) {
    response.headers.set('Content-Type', 'text/css; charset=utf-8');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  if (pathname.endsWith('.js')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  if (pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // AUTENTICACIÓN - Obtener token de las cookies
  const accessToken = request.cookies.get('bsk-access-token')?.value;

  // Verificar si el usuario está autenticado
  let isAuthenticated = false;
  let userPayload = null;

  if (accessToken) {
    try {
      userPayload = verifyAccessToken(accessToken);
      isAuthenticated = true;
      console.log(`[MIDDLEWARE] Usuario autenticado: ${userPayload.email}, ruta: ${pathname}`);
    } catch (error) {
      // Token inválido o expirado
      isAuthenticated = false;
      console.log(`[MIDDLEWARE] Token inválido para ruta: ${pathname}, error: ${error}`);
    }
  } else {
    console.log(`[MIDDLEWARE] No hay token para ruta: ${pathname}`);
  }

  // Manejar rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirigir a login con returnUrl
      console.log(`[MIDDLEWARE] Redirigiendo a login desde: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Manejar rutas de autenticación (login, register, etc.)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirigir al dashboard si ya está autenticado (a menos que tenga returnUrl específico)
      const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
      console.log(`[MIDDLEWARE] Usuario autenticado intentando acceder a ${pathname}, redirigiendo a: ${returnUrl}`);
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }
  }

  // Security for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // CORS for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Para rutas de API protegidas
    const protectedApiRoutes = ['/api/auth/me', '/api/auth/logout', '/api/users', '/api/admin'];
    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        return NextResponse.json(
          { success: false, message: 'No autorizado', error: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Specifically match static files to handle MIME types
    '/_next/static/(.*)',
  ],
}
