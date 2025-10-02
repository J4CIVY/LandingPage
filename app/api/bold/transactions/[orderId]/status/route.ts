import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BoldTransaction from '@/lib/models/BoldTransaction';
import { verifyAuth } from '@/lib/auth-utils';
import { BOLD_CONFIG } from '@/lib/bold-utils';

/**
 * Consulta el estado de una transacción Bold usando la API de Bold
 * GET /api/bold/transactions/[orderId]/status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID es requerido',
          error: 'MISSING_ORDER_ID'
        },
        { status: 400 }
      );
    }

    // Buscar transacción en nuestra BD
    const transaction = await BoldTransaction.findOne({ orderId });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transacción no encontrada',
          error: 'TRANSACTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea dueño de la transacción
    if (transaction.userId.toString() !== authResult.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permiso para ver esta transacción',
          error: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Consultar estado en la API de Bold
    try {
      const boldResponse = await fetch(
        `${BOLD_CONFIG.API_BASE_URL}/payment-voucher/${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `x-api-key ${BOLD_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (boldResponse.ok) {
        const boldData = await boldResponse.json();
        
        // Actualizar nuestra transacción si el estado cambió
        if (boldData.payment_status && boldData.payment_status !== transaction.status) {
          console.log(`Updating transaction status from ${transaction.status} to ${boldData.payment_status}`);
          
          transaction.status = boldData.payment_status;
          transaction.boldTransactionId = boldData.transaction_id;
          transaction.paymentMethod = boldData.payment_method;
          
          if (boldData.transaction_date) {
            transaction.transactionDate = new Date(boldData.transaction_date);
          }
          
          transaction.boldWebhookData = boldData;
          await transaction.save();
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Estado de transacción obtenido',
            data: {
              transaction: {
                orderId: transaction.orderId,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                description: transaction.description,
                paymentMethod: transaction.paymentMethod,
                transactionDate: transaction.transactionDate,
                createdAt: transaction.createdAt
              },
              boldData
            }
          },
          { status: 200 }
        );
      } else {
        // Si Bold no encuentra la transacción, devolver nuestro estado
        console.warn(`Bold API returned ${boldResponse.status} for order ${orderId}`);
        
        return NextResponse.json(
          {
            success: true,
            message: 'Estado de transacción obtenido (local)',
            data: {
              transaction: {
                orderId: transaction.orderId,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                description: transaction.description,
                paymentMethod: transaction.paymentMethod,
                transactionDate: transaction.transactionDate,
                createdAt: transaction.createdAt
              }
            }
          },
          { status: 200 }
        );
      }
    } catch (boldError: any) {
      console.error('Error querying Bold API:', boldError);
      
      // Retornar estado local si hay error con Bold
      return NextResponse.json(
        {
          success: true,
          message: 'Estado de transacción obtenido (local)',
          data: {
            transaction: {
              orderId: transaction.orderId,
              status: transaction.status,
              amount: transaction.amount,
              currency: transaction.currency,
              description: transaction.description,
              paymentMethod: transaction.paymentMethod,
              transactionDate: transaction.transactionDate,
              createdAt: transaction.createdAt
            }
          },
          warning: 'No se pudo consultar el estado en Bold'
        },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Error checking transaction status:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      },
      { status: 500 }
    );
  }
}
