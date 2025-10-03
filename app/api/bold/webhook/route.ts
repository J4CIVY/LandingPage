import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BoldTransaction, { TransactionStatus, PaymentMethod } from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { getEmailService } from '@/lib/email-service';
import { 
  sendEventRegistrationNotification, 
  formatEventDate, 
  formatPaymentAmount,
  generateInvoiceUrl 
} from '@/lib/bird-crm';
import { ActivityLoggerService } from '@/lib/activity-logger';

/**
 * Webhook para recibir notificaciones de Bold sobre el estado de las transacciones
 * POST /api/bold/webhook
 * 
 * Bold enviará un POST con la información de la transacción cuando cambie su estado
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Obtener datos del webhook
    const webhookData = await request.json();
    
    console.log('📨 Bold Webhook received:', JSON.stringify(webhookData, null, 2));

    // Extraer datos importantes
    const {
      reference_id: referenceId,
      transaction_id: transactionId,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      total,
      subtotal,
      description,
      payer_email: payerEmail,
      transaction_date: transactionDate,
      link_id: linkId
    } = webhookData;

    if (!referenceId) {
      console.error('❌ No reference_id in webhook data');
      return NextResponse.json(
        {
          success: false,
          message: 'reference_id es requerido',
          error: 'MISSING_REFERENCE_ID'
        },
        { status: 400 }
      );
    }

    // Buscar la transacción en nuestra BD
    const transaction = await BoldTransaction.findOne({ orderId: referenceId });

    if (!transaction) {
      console.error(`❌ Transaction not found: ${referenceId}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Transacción no encontrada',
          error: 'TRANSACTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    console.log(`📝 Processing transaction: ${referenceId}, Status: ${paymentStatus}`);

    // Actualizar según el estado recibido
    switch (paymentStatus) {
      case 'APPROVED':
        await handleApprovedPayment(transaction, webhookData);
        break;
        
      case 'REJECTED':
        await handleRejectedPayment(transaction, webhookData);
        break;
        
      case 'FAILED':
        await handleFailedPayment(transaction, webhookData);
        break;
        
      case 'VOIDED':
        await handleVoidedPayment(transaction, webhookData);
        break;
        
      case 'PROCESSING':
      case 'PENDING':
        await handlePendingPayment(transaction, webhookData);
        break;
        
      default:
        console.warn(`⚠️ Unknown payment status: ${paymentStatus}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook procesado exitosamente'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error processing Bold webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Maneja un pago aprobado
 */
async function handleApprovedPayment(transaction: any, webhookData: any) {
  try {
    console.log(`✅ Processing APPROVED payment for transaction: ${transaction.orderId}`);

    // Generar token de acceso si no existe
    if (!transaction.accessToken) {
      const crypto = require('crypto');
      transaction.accessToken = crypto.randomBytes(32).toString('hex');
    }

    // Actualizar transacción
    await transaction.markAsApproved(webhookData);

    // Registrar al usuario en el evento
    const event = await Event.findById(transaction.eventId);
    const user = await User.findById(transaction.userId);

    if (!event || !user) {
      console.error('Event or user not found');
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

      console.log(`✅ User registered to event: ${event.name}`);
    }

    // Enviar email de confirmación con enlace a factura
    try {
      const emailService = getEmailService();
      
      // Obtener ubicación del evento
      let lugarEvento = 'Por confirmar';
      if (event.departureLocation) {
        lugarEvento = `${event.departureLocation.city}, ${event.departureLocation.state || ''}`;
      } else if (event.location) {
        lugarEvento = event.location;
      } else if (event.ubicacion) {
        lugarEvento = event.ubicacion;
      }

      const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com'}/api/bold/transactions/${transaction._id.toString()}/invoice?token=${transaction.accessToken}`;

      await emailService.sendEventRegistrationConfirmation(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          eventName: event.name || event.nombre,
          eventDate: event.startDate 
            ? new Date(event.startDate).toLocaleDateString('es-CO', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Por confirmar',
          eventLocation: lugarEvento,
          isFree: false,
          invoiceUrl: invoiceUrl,
          amount: transaction.amount,
          currency: transaction.currency
        }
      );
      
      console.log(`📧 Event registration email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // No lanzar error, el pago ya fue procesado
    }

    // Enviar notificación de WhatsApp a través de Bird CRM
    try {
      // Verificar que el usuario tenga teléfono
      if (user.phone || user.telefono) {
        const phoneNumber = user.phone || user.telefono;
        
        // Obtener ubicación del evento
        let lugarEvento = 'Por confirmar';
        if (event.departureLocation) {
          lugarEvento = `${event.departureLocation.city}, ${event.departureLocation.state || ''}`;
        } else if (event.location) {
          lugarEvento = event.location;
        } else if (event.ubicacion) {
          lugarEvento = event.ubicacion;
        }

        const notificationData = {
          nombreMiembro: `${user.firstName} ${user.lastName}`,
          nombreEvento: event.name || event.nombre,
          fechaEvento: formatEventDate(event.startDate || event.fecha),
          lugarEvento: lugarEvento,
          valorPagado: formatPaymentAmount(transaction.amount, transaction.currency),
          urlFactura: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com'}/api/bold/transactions/${transaction._id.toString()}/invoice?token=${transaction.accessToken}`,
          telefonoMiembro: phoneNumber
        };

        console.log('📱 Enviando notificación de WhatsApp a Bird CRM...');
        const whatsappResult = await sendEventRegistrationNotification(notificationData);
        
        if (whatsappResult.success) {
          console.log(`✅ Notificación de WhatsApp enviada a: ${phoneNumber}`);
        } else {
          console.error(`❌ Error al enviar notificación de WhatsApp: ${whatsappResult.error}`);
        }
      } else {
        console.warn('⚠️ Usuario no tiene número de teléfono registrado, no se envió notificación de WhatsApp');
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
      // No lanzar error, el pago ya fue procesado
    }

    // Registrar actividad de pago completado
    try {
      await ActivityLoggerService.logPaymentCompleted(
        transaction.userId.toString(),
        transaction.orderId,
        transaction.amount,
        event.name || event.nombre
      );
    } catch (activityError) {
      console.error('Error logging payment activity:', activityError);
      // No interrumpir el flujo si falla el logging
    }

  } catch (error) {
    console.error('Error handling approved payment:', error);
    throw error;
  }
}

/**
 * Maneja un pago rechazado
 */
async function handleRejectedPayment(transaction: any, webhookData: any) {
  console.log(`❌ Processing REJECTED payment for transaction: ${transaction.orderId}`);
  await transaction.markAsRejected(webhookData);
  
  // Registrar actividad de pago fallido
  try {
    const event = await Event.findById(transaction.eventId);
    await ActivityLoggerService.logPaymentFailed(
      transaction.userId.toString(),
      transaction.orderId,
      transaction.amount,
      event?.name || event?.nombre || 'Evento desconocido'
    );
  } catch (activityError) {
    console.error('Error logging payment failure activity:', activityError);
    // No interrumpir el flujo si falla el logging
  }
  
  // Opcional: enviar email notificando el rechazo
  try {
    const user = await User.findById(transaction.userId);
    if (user) {
      const emailService = getEmailService();
      await emailService.sendPaymentRejected(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          eventName: transaction.eventName,
          orderId: transaction.orderId,
          reason: 'Pago rechazado por la entidad financiera'
        }
      );
    }
  } catch (emailError) {
    console.error('Error sending rejection email:', emailError);
  }
}

/**
 * Maneja un pago fallido
 */
async function handleFailedPayment(transaction: any, webhookData: any) {
  console.log(`⚠️ Processing FAILED payment for transaction: ${transaction.orderId}`);
  await transaction.markAsFailed(webhookData);
}

/**
 * Maneja un pago anulado
 */
async function handleVoidedPayment(transaction: any, webhookData: any) {
  console.log(`🚫 Processing VOIDED payment for transaction: ${transaction.orderId}`);
  
  transaction.status = TransactionStatus.VOIDED;
  transaction.boldTransactionId = webhookData.transaction_id || webhookData.transactionId;
  transaction.boldWebhookData = webhookData;
  await transaction.save();

  // Si estaba aprobado y se anuló, remover al usuario del evento
  const user = await User.findById(transaction.userId);
  const event = await Event.findById(transaction.eventId);

  if (user && event) {
    // Remover del evento
    if (user.eventsRegistered?.includes(transaction.eventId)) {
      user.eventsRegistered = user.eventsRegistered.filter(
        (id: any) => id.toString() !== transaction.eventId.toString()
      );
      await user.save();

      // Reducir contador de participantes
      if (event.currentParticipants > 0) {
        event.currentParticipants -= 1;
        await event.save();
      }
    }
  }
}

/**
 * Maneja un pago pendiente o en proceso
 */
async function handlePendingPayment(transaction: any, webhookData: any) {
  console.log(`⏳ Processing PENDING/PROCESSING payment for transaction: ${transaction.orderId}`);
  
  const status = webhookData.payment_status === 'PROCESSING' 
    ? TransactionStatus.PROCESSING 
    : TransactionStatus.PENDING;
    
  transaction.status = status;
  transaction.boldTransactionId = webhookData.transaction_id || webhookData.transactionId;
  transaction.boldLinkId = webhookData.link_id;
  transaction.paymentMethod = webhookData.payment_method;
  transaction.boldWebhookData = webhookData;
  await transaction.save();
}

/**
 * Método GET para verificar que el webhook está activo
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Bold webhook endpoint is active',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
