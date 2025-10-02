import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BoldTransaction, { TransactionStatus } from '@/lib/models/BoldTransaction';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * Verifica si el usuario tiene un pago aprobado para un evento específico
 * GET /api/bold/transactions/check-payment?eventId=[eventId]
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    // Obtener eventId de los query params
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          message: 'eventId es requerido',
          error: 'MISSING_EVENT_ID'
        },
        { status: 400 }
      );
    }

    // Buscar si existe una transacción aprobada para este usuario y evento
    const approvedTransaction = await BoldTransaction.findOne({
      userId: authResult.user.id,
      eventId: eventId,
      status: TransactionStatus.APPROVED
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          hasApprovedPayment: !!approvedTransaction,
          transaction: approvedTransaction ? {
            orderId: approvedTransaction.orderId,
            amount: approvedTransaction.amount,
            currency: approvedTransaction.currency,
            paymentMethod: approvedTransaction.paymentMethod,
            approvedAt: approvedTransaction.updatedAt
          } : null
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error checking payment:', error);
    
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
