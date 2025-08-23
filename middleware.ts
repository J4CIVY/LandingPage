import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')

  // Manejar archivos CSS estáticos
  if (pathname.endsWith('.css')) {
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Manejar archivos JavaScript estáticos
  if (pathname.endsWith('.js')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Manejar archivos de fuentes
  if (pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Access-Control-Allow-Origin', 'https://bskmt.com')
    return response
  }

  // Manejar imágenes
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Security for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // CORS for API routes
    response.headers.set('Access-Control-Allow-Origin', 'https://bskmt.com')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
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
