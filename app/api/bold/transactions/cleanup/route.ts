import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BoldTransaction, { TransactionStatus } from '@/lib/models/BoldTransaction';
import { BOLD_CONFIG } from '@/lib/bold-utils';

/**
 * Consulta el estado de una transacción en la API de Bold
 */
async function queryBoldTransactionStatus(orderId: string): Promise<{
  status: string | null;
  found: boolean;
}> {
  try {
    const boldResponse = await fetch(
      `${BOLD_CONFIG.API_BASE_URL}/payment-voucher/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `x-api-key ${BOLD_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      }
    );

    if (boldResponse.ok) {
      const boldData = await boldResponse.json();
      return {
        status: boldData.payment_status || null,
        found: true
      };
    }

    // Si Bold retorna 404, la transacción no existe o expiró
    if (boldResponse.status === 404) {
      return {
        status: 'CANCELLED',
        found: false
      };
    }

    return {
      status: null,
      found: false
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error querying Bold for order ${orderId}:`, error.message);
    return {
      status: null,
      found: false
    };
  }
}

/**
 * Limpia transacciones pendientes expiradas consultando el estado real en Bold
 * POST /api/bold/transactions/cleanup
 * 
 * Este endpoint puede ser ejecutado por un cron job para limpiar
 * transacciones pendientes antiguas en todo el sistema.
 * 
 * Requiere un token de autorización para seguridad.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar token de autorización (para cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_SECRET_TOKEN || 'change-this-in-production';
    
    if (authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Calcular tiempo de expiración (24 horas)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - 24);

    // Buscar transacciones pendientes expiradas
    const expiredTransactions = await BoldTransaction.find({
      status: { $in: ['PENDING', 'PROCESSING'] },
      createdAt: { $lt: expirationTime }
    }).limit(100); // Procesar máximo 100 por vez

    const results = {
      total: expiredTransactions.length,
      updated: 0,
      cancelled: 0,
      approved: 0,
      failed: 0,
      errors: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions: [] as any[]
    };

    // Procesar cada transacción consultando su estado real en Bold
    for (const transaction of expiredTransactions) {
      try {
        // Consultar estado en Bold
        const { status: boldStatus, found } = await queryBoldTransactionStatus(transaction.orderId);

        let newStatus = transaction.status;
        let updated = false;

        if (boldStatus) {
          // Actualizar con el estado real de Bold
          newStatus = boldStatus as TransactionStatus;
          updated = true;

          if (boldStatus === 'APPROVED') {
            results.approved++;
          } else if (boldStatus === 'CANCELLED' || boldStatus === 'REJECTED' || boldStatus === 'FAILED') {
            results.cancelled++;
          }
        } else if (!found) {
          // Si Bold no encontró la transacción (404), cancelarla
          newStatus = TransactionStatus.CANCELLED;
          updated = true;
          results.cancelled++;
        } else {
          // Si hubo error consultando Bold, cancelar por expiración
          newStatus = TransactionStatus.CANCELLED;
          updated = true;
          results.cancelled++;
        }

        if (updated && newStatus !== transaction.status) {
          transaction.status = newStatus;
          transaction.updatedAt = new Date();
          await transaction.save();
          results.updated++;

          results.transactions.push({
            orderId: transaction.orderId,
            userId: transaction.userId,
            oldStatus: 'PENDING',
            newStatus,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            boldStatus: boldStatus || 'NOT_FOUND'
          });
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(`Error processing transaction ${transaction.orderId}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transacciones expiradas procesadas exitosamente',
      data: {
        ...results,
        expirationTime: expirationTime.toISOString(),
        note: 'Los estados se actualizaron consultando la API de Bold'
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error cleaning up expired transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al limpiar transacciones' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para verificar cuántas transacciones están pendientes de limpieza
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar token de autorización
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_SECRET_TOKEN || 'change-this-in-production';
    
    if (authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Calcular tiempo de expiración (24 horas)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - 24);

    // Contar transacciones pendientes expiradas
    const count = await BoldTransaction.countDocuments({
      status: { $in: ['PENDING', 'PROCESSING'] },
      createdAt: { $lt: expirationTime }
    });

    return NextResponse.json({
      success: true,
      data: {
        expiredTransactionsCount: count,
        expirationTime: expirationTime.toISOString()
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error checking expired transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar transacciones' },
      { status: 500 }
    );
  }
}
