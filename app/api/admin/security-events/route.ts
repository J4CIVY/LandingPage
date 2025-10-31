import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import {
  getRecentSecurityEvents,
  getEventsByType,
  getEventsByIP,
  getEventsBySeverity,
  resolveSecurityEvent,
  SecurityEventType,
  SecurityEvent,
} from '@/lib/security-events';

/**
 * GET /api/admin/security-events
 * Get security events with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Se requieren privilegios de administrador' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all', 'type', 'ip', 'severity'
    const value = searchParams.get('value');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    let events: SecurityEvent[] = [];
    
    switch (filter) {
      case 'type':
        if (value) {
          events = await getEventsByType(value as SecurityEventType, limit);
        }
        break;
      case 'ip':
        if (value) {
          events = await getEventsByIP(value, limit);
        }
        break;
      case 'severity':
        if (value) {
          events = await getEventsBySeverity(value as SecurityEvent['severity'], limit);
        }
        break;
      default:
        events = await getRecentSecurityEvents(limit, offset);
    }
    
    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('[Admin API] Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos de seguridad' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/security-events
 * Resolve a security event
 */
export async function PATCH(request: NextRequest) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Se requieren privilegios de administrador' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { eventId, notes } = body;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID es requerido' },
        { status: 400 }
      );
    }
    
    const success = await resolveSecurityEvent(
      eventId,
      authResult.user.email,
      notes
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Evento resuelto correctamente',
    });
  } catch (error) {
    console.error('[Admin API] Error resolving security event:', error);
    return NextResponse.json(
      { error: 'Error al resolver evento' },
      { status: 500 }
    );
  }
}
