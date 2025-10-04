import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import BoldTransaction, { TransactionStatus } from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import { BOLD_CONFIG } from '@/lib/bold-utils';

/**
 * Consulta el estado de una transacción en Bold (versión rápida)
 */
async function quickCheckBoldStatus(orderId: string): Promise<string | null> {
  try {
    const boldResponse = await fetch(
      `${BOLD_CONFIG.API_BASE_URL}/payment-voucher/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `x-api-key ${BOLD_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(3000) // 3 segundos timeout
      }
    );

    if (boldResponse.ok) {
      const boldData = await boldResponse.json();
      return boldData.payment_status || null;
    }

    // Si retorna 404, la transacción no existe en Bold
    if (boldResponse.status === 404) {
      return TransactionStatus.CANCELLED;
    }

    return null;
  } catch (error) {
    // En caso de error o timeout, retornar null para no bloquear
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Cancelar transacciones pendientes expiradas (más de 24 horas)
    // consultando opcionalmente el estado real en Bold
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - 24);

    const expiredPending = await BoldTransaction.find({
      userId: authResult.session.userId,
      status: { $in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] },
      createdAt: { $lt: expirationTime }
    }).limit(20); // Limitar para no bloquear la consulta

    // Procesar transacciones expiradas consultando Bold
    for (const transaction of expiredPending) {
      try {
        const boldStatus = await quickCheckBoldStatus(transaction.orderId);
        
        if (boldStatus) {
          // Actualizar con el estado real de Bold
          transaction.status = boldStatus as TransactionStatus;
        } else {
          // Si Bold no responde o retorna 404, cancelar
          transaction.status = TransactionStatus.CANCELLED;
        }
        
        transaction.updatedAt = new Date();
        await transaction.save();
      } catch (error) {
        // Si hay error, cancelar por expiración
        transaction.status = TransactionStatus.CANCELLED;
        transaction.updatedAt = new Date();
        await transaction.save();
      }
    }

    // Obtener todas las transacciones del usuario ordenadas por fecha descendente
    const transactions = await BoldTransaction.find({ userId: authResult.session.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Enriquecer con información del evento
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        // Si ya tiene eventName en la BD, usarlo
        if (transaction.eventName) {
          return transaction;
        }

        // Si no tiene eventName pero tiene eventId, buscar el evento
        if (transaction.eventId) {
          try {
            const event: any = await Event.findById(transaction.eventId).lean();
            const eventName = event?.name || null;
            
            return {
              ...transaction,
              eventName,
              eventNotFound: !event
            };
          } catch (error) {
            return {
              ...transaction,
              eventName: null,
              eventError: true
            };
          }
        }

        // No tiene evento asociado
        return {
          ...transaction,
          eventName: null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        transactions: enrichedTransactions
      }
    });
  } catch (error: any) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las transacciones' },
      { status: 500 }
    );
  }
}
