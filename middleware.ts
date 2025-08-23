import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Manejar archivos CSS estáticos
  if (pathname.endsWith('.css')) {
    const response = NextResponse.next()
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Manejar archivos JavaScript estáticos
  if (pathname.endsWith('.js')) {
    const response = NextResponse.next()
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Manejar archivos de fuentes
  if (pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Manejar imágenes
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  return NextResponse.next()
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
