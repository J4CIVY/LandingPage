import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BoldTransaction from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';
import { BOLD_CONFIG } from '@/lib/bold-utils';

/**
 * Consulta el estado de una transacción Bold usando la API de Bold
 * GET /api/bold/transactions/[orderId]/status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
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

    const { orderId } = await params;

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
          
          const oldStatus = transaction.status;
          transaction.status = boldData.payment_status;
          transaction.boldTransactionId = boldData.transaction_id;
          transaction.paymentMethod = boldData.payment_method;
          
          if (boldData.transaction_date) {
            transaction.transactionDate = new Date(boldData.transaction_date);
          }
          
          transaction.boldWebhookData = boldData;
          await transaction.save();

          // Si el pago fue aprobado y antes no lo estaba, registrar al usuario en el evento
          if (boldData.payment_status === 'APPROVED' && oldStatus !== 'APPROVED') {
            await registerUserToEvent(transaction);
          }
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

/**
 * Registra al usuario en el evento después de un pago aprobado
 */
async function registerUserToEvent(transaction: any) {
  try {
    const event = await Event.findById(transaction.eventId);
    const user = await User.findById(transaction.userId);

    if (!event || !user) {
      console.error('Event or user not found for registration');
      return;
    }

    // Verificar si ya está registrado
    const isAlreadyRegistered = user.eventsRegistered?.includes(transaction.eventId);

    if (!isAlreadyRegistered) {
      // Agregar usuario a los registrados del evento
      event.currentParticipants += 1;
      
      // Agregar también a la lista de participants (importante para consistencia)
      if (!event.participants) {
        event.participants = [];
      }
      event.participants.push(transaction.userId);
      
      await event.save();

      // Agregar evento al usuario
      if (!user.eventsRegistered) {
        user.eventsRegistered = [];
      }
      user.eventsRegistered.push(transaction.eventId);
      await user.save();

    } else {
    }
  } catch (error) {
    console.error('Error registering user to event:', error);
  }
}
