/**
 * CSRF Protection Utilities
 * 
 * Provides CSRF token generation and validation for state-changing operations.
 * Works in conjunction with SameSite=Strict cookies for defense-in-depth.
 * 
 * @security Double Submit Cookie Pattern + Server-side validation
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'bsk-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generates a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Sets CSRF token as an HTTP-only cookie and returns the token
 * for client-side inclusion in requests
 */
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });
  
  // Also set in a readable cookie for client-side access
  response.cookies.set(`${CSRF_COOKIE_NAME}-readable`, token, {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });
  
  return token;
}

/**
 * Validates CSRF token from request header against cookie value
 * 
 * @param request - Next.js request object
 * @returns boolean - true if token is valid, false otherwise
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  // Both must exist
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Middleware helper to require CSRF token for state-changing operations
 * 
 * @param request - Next.js request object
 * @returns NextResponse with error if CSRF validation fails, null otherwise
 */
export function requireCSRFToken(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  
  // Only validate CSRF for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSRF token validation failed',
          error: 'INVALID_CSRF_TOKEN'
        },
        { status: 403 }
      );
    }
  }
  
  return null;
}

/**
 * Hook to get CSRF token from cookie for client-side usage
 * This should be called from client components to get the token
 * to include in request headers
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}-readable=`)
  );
  
  if (!csrfCookie) {
    return null;
  }
  
  return csrfCookie.split('=')[1];
}

/**
 * Utility to add CSRF token to fetch headers
 */
export function addCSRFTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFTokenFromCookie();
  
  if (token) {
    return {
      ...headers,
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  return headers;
}
