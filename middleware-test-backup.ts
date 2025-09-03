import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  console.log(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname}`);
  
  const response = NextResponse.next();
  
  // Simple test
  if (request.nextUrl.pathname === '/test-middleware') {
    return NextResponse.json({ message: 'Middleware funcionando!' });
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
