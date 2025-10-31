import { NextRequest, NextResponse } from 'next/server';
import MembershipRenewalService from '@/lib/services/membership-renewal';

// POST - Ejecutar proceso de renovaciones automáticas (cron job)
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización del cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 });
    }

    
    const result = await MembershipRenewalService.processAutomaticRenewals();
    

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        renewalsProcessed: result.renewalsProcessed,
        notificationsSent: result.notificationsSent,
        errorsCount: result.errors.length,
        errors: result.errors.slice(0, 5) // Solo los primeros 5 errores para no saturar el log
      }
    }, { 
      status: result.success ? 200 : 500 
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error en cron job de renovaciones:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// GET - Verificar estado del servicio de renovaciones
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 });
    }

    // Obtener estadísticas básicas del servicio
    const currentDate = new Date();
    const nextRenewalPeriod = MembershipRenewalService.calculateNextRenewalPeriod('annual', currentDate);

    return NextResponse.json({
      success: true,
      message: 'Servicio de renovaciones operativo',
      data: {
        currentDate: currentDate.toISOString(),
        nextAnnualRenewal: nextRenewalPeriod.endDate.toISOString(),
        renewalStartDate: nextRenewalPeriod.renewalStartDate.toISOString(),
        serviceStatus: 'active'
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error checking renewal service status:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verificando estado del servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}