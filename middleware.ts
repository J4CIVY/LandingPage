import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  const userAgent = request.headers.get('user-agent') || ''

  // Enhanced security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
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
  ]
  
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
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent))
  
  if (isSuspicious && !isLegitimate) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Block requests with suspicious query parameters
  const url = request.nextUrl
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
  ]
  
  for (const [key, value] of url.searchParams) {
    const queryString = `${key}=${value}`.toLowerCase()
    if (suspiciousQueries.some(pattern => queryString.includes(pattern))) {
      return new NextResponse('Bad Request', { status: 400 })
    }
  }

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
