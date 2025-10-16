import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getSecurityStatistics } from '@/lib/security-events';

/**
 * GET /api/admin/security-stats
 * Get security statistics for dashboard
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
    
    const stats = await getSecurityStatistics();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Admin API] Error fetching security statistics:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
