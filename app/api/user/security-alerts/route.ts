import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';
import User from '@/lib/models/User';
import { requireCSRFToken } from '@/lib/csrf-protection';

/**
 * GET /api/user/security-alerts
 * Obtener configuración de alertas de seguridad del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No autorizado',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Conectar a la base de datos
    await dbConnect();

    // Buscar usuario en ExtendedUser
    let extendedUser = await ExtendedUser.findOne({ email: authResult.user.email });

    // Si no existe en ExtendedUser, buscar en User y crear registro
    if (!extendedUser) {
      const user = await User.findById(userId);
      
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

      // Crear registro en ExtendedUser con valores por defecto
      extendedUser = new ExtendedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        securityAlerts: true // Por defecto activado
      });

      await extendedUser.save();
    }

    // Devolver configuración de alertas de seguridad
    return NextResponse.json(
      {
        success: true,
        data: {
          securityAlerts: extendedUser.securityAlerts ?? true
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener alertas de seguridad:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/security-alerts
 * Actualizar configuración de alertas de seguridad
 */
export async function PATCH(request: NextRequest) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No autorizado',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const body = await request.json();

    // Validar que securityAlerts sea un booleano
    if (typeof body.securityAlerts !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: 'El campo securityAlerts debe ser un valor booleano',
          error: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar usuario en ExtendedUser
    let extendedUser = await ExtendedUser.findOne({ email: authResult.user.email });

    // Si no existe en ExtendedUser, buscar en User y crear registro
    if (!extendedUser) {
      const user = await User.findById(userId);
      
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

      // Crear registro en ExtendedUser
      extendedUser = new ExtendedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        securityAlerts: body.securityAlerts
      });
    } else {
      // Actualizar configuración
      extendedUser.securityAlerts = body.securityAlerts;
    }

    await extendedUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `Alertas de seguridad ${body.securityAlerts ? 'activadas' : 'desactivadas'} correctamente`,
        data: {
          securityAlerts: extendedUser.securityAlerts
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar alertas de seguridad:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
