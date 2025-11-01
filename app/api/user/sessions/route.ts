import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import Session from '@/lib/models/Session';
import { getLocationByIP, formatLocation } from '@/lib/services/geolocation';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET - Obtener todas las sesiones activas del usuario
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener todas las sesiones activas del usuario
    const sessions = await Session.find({ 
      userId: authResult.session.userId,
      isActive: true,
      expiresAt: { $gt: new Date() } // Solo sesiones no expiradas
    }).sort({ lastUsed: -1 });

    // Formatear la respuesta con geolocalización
    const activeSessions = await Promise.all(sessions.map(async (session) => {
      // Determinar tipo de dispositivo basado en user agent o device info
      let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
      const userAgent = session.deviceInfo?.userAgent?.toLowerCase() || '';
      const device = session.deviceInfo?.device?.toLowerCase() || '';
      
      if (userAgent.includes('mobile') || device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
        deviceType = 'mobile';
      } else if (userAgent.includes('tablet') || device.includes('tablet') || device.includes('ipad')) {
        deviceType = 'tablet';
      }

  // Obtener geolocalización por IP
  const ip = session.deviceInfo?.ip || '';
  const geoLocation = await getLocationByIP(ip);
  // getLocationByIP puede devolver null; evitar pasar null a formatLocation
  const location = geoLocation ? formatLocation(geoLocation) : null;

      return {
        id: session._id.toString(),
        device: session.deviceInfo?.device || 'Dispositivo desconocido',
        deviceType,
        browser: session.deviceInfo?.browser || 'Navegador desconocido',
        os: session.deviceInfo?.os || 'SO desconocido',
        location,
        ip: ip || 'IP desconocida',
        lastActive: session.lastUsed,
        loginTime: session.createdAt,
        isCurrent: session._id.toString() === authResult.session!.sessionId
      };
    }));

    return NextResponse.json({ sessions: activeSessions });
  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}

// DELETE - Cerrar una sesión específica
export async function DELETE(request: NextRequest) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    // No permitir cerrar la sesión actual
    if (sessionId === authResult.session.sessionId) {
      return NextResponse.json(
        { error: 'No puedes cerrar tu sesión actual' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Buscar y desactivar la sesión
    const session = await Session.findOne({
      _id: sessionId,
      userId: authResult.session.userId,
      isActive: true
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Desactivar la sesión
    session.isActive = false;
    await session.save();

    return NextResponse.json({ 
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
