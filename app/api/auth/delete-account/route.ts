/**
 * Delete Account Endpoint
 * 
 * Allows authenticated users to permanently delete their own accounts.
 * This is a critical operation protected by CSRF tokens and requires
 * password confirmation.
 * 
 * @security
 * - CSRF Protection: Required
 * - Authentication: Required
 * - Password Confirmation: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection - Critical operation (account deletion)
    const csrfError = requireCSRFToken(request);
    if (csrfError) {
      console.error('[SECURITY] CSRF validation failed on delete-account endpoint');
      return csrfError;
    }

    await connectDB();

    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Autenticación requerida',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { password, confirmDeletion } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Se requiere la contraseña para confirmar la eliminación',
          error: 'PASSWORD_REQUIRED'
        },
        { status: 400 }
      );
    }

    if (confirmDeletion !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Debes confirmar la eliminación escribiendo "DELETE_MY_ACCOUNT"',
          error: 'CONFIRMATION_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findById(authResult.user.id).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Contraseña incorrecta',
          error: 'INVALID_PASSWORD'
        },
        { status: 401 }
      );
    }

    // Prevent admin/super-admin self-deletion (optional safety measure)
    if (user.role === 'super-admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Los super-administradores no pueden eliminar sus propias cuentas. Contacta a otro super-admin.',
          error: 'CANNOT_DELETE_SUPERADMIN'
        },
        { status: 403 }
      );
    }

    // Log the deletion for audit purposes
    console.log(`[AUDIT] Account deletion requested by user: ${user.email} (${user._id})`);

    // Delete all user sessions
    await Session.deleteMany({ userId: user._id });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    // Create response with cleared cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Tu cuenta ha sido eliminada permanentemente'
      },
      { status: 200 }
    );

    // Clear authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0
    };

    response.cookies.set('bsk-access-token', '', cookieOptions);
    response.cookies.set('bsk-refresh-token', '', cookieOptions);
    response.cookies.set('bsk-csrf-token', '', cookieOptions);
    response.cookies.set('bsk-csrf-token-readable', '', cookieOptions);

    return response;

  } catch (error) {
    console.error('Error deleting account:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error al eliminar la cuenta',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
