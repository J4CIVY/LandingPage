/**
 * CSRF Token Generation Endpoint
 * 
 * Provides CSRF tokens to authenticated clients for subsequent requests.
 * The token is set as both an HttpOnly cookie (for validation) and returned
 * in the response body (for client-side inclusion in request headers).
 * 
 * @security This endpoint should be called before making state-changing operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/csrf-protection';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/csrf-token
 * 
 * Generates and returns a CSRF token for the authenticated user.
 * The token is valid for 2 hours.
 * 
 * @requires Authentication - User must be logged in
 * @returns JSON with CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const auth = await verifyAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required to obtain CSRF token',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'CSRF token generated successfully',
      data: {
        expiresIn: 7200, // 2 hours in seconds
        userId: auth.user?.id // For debugging/logging purposes
      }
    });

    // Generate and set CSRF token
    const token = setCSRFToken(response);

    // Also return token in response body for client-side access
    return NextResponse.json({
      success: true,
      message: 'CSRF token generated successfully',
      data: {
        csrfToken: token,
        expiresIn: 7200,
        userId: auth.user?.id
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error generating CSRF token:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error generating CSRF token',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/csrf-token
 * 
 * Alternative method to generate CSRF token (some clients prefer POST)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
