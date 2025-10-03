import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import BoldTransaction from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import ExtendedUser from '@/lib/models/ExtendedUser';
import { 
  sendEventRegistrationNotification, 
  formatEventDate, 
  formatPaymentAmount,
  generateInvoiceUrl 
} from '@/lib/bird-crm';

/**
 * Endpoint para reenviar notificación de WhatsApp manualmente
 * POST /api/bold/transactions/[orderId]/resend-notification
 * 
 * Útil para:
 * - Testing de la integración con Bird CRM
 * - Reenviar notificaciones en caso de fallos
 * - Enviar notificación a pagos antiguos
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

    // Await params en Next.js 15
    const { orderId } = await params;

    // Obtener la transacción
    const transaction: any = await BoldTransaction.findById(orderId).lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la transacción pertenece al usuario (o que sea admin)
    const user: any = await ExtendedUser.findById(authResult.session.userId);
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    
    if (transaction.userId.toString() !== authResult.session.userId && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Verificar que el pago esté aprobado
    if (transaction.status !== 'APPROVED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo se pueden enviar notificaciones de pagos aprobados',
          status: transaction.status 
        },
        { status: 400 }
      );
    }

    // Obtener información del evento y usuario completo
    const [event, transactionUser]: [any, any] = await Promise.all([
      Event.findById(transaction.eventId).lean(),
      ExtendedUser.findById(transaction.userId).lean()
    ]);

    if (!event || !transactionUser) {
      return NextResponse.json(
        { success: false, error: 'Evento o usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga teléfono
    const phoneNumber = transactionUser.phone || transactionUser.telefono;
    if (!phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El usuario no tiene número de teléfono registrado' 
        },
        { status: 400 }
      );
    }

    // Obtener ubicación del evento
    let lugarEvento = 'Por confirmar';
    if (event.departureLocation) {
      lugarEvento = `${event.departureLocation.city}, ${event.departureLocation.state || ''}`;
    } else if (event.location) {
      lugarEvento = event.location;
    } else if (event.ubicacion) {
      lugarEvento = event.ubicacion;
    }

    // Preparar datos para la notificación
    const notificationData = {
      nombreMiembro: `${transactionUser.firstName || transactionUser.nombre} ${transactionUser.lastName || transactionUser.apellido}`,
      nombreEvento: event.name || event.nombre,
      fechaEvento: formatEventDate(event.startDate || event.fecha),
      lugarEvento: lugarEvento,
      valorPagado: formatPaymentAmount(transaction.amount, transaction.currency),
      urlFactura: generateInvoiceUrl(transaction._id.toString()),
      telefonoMiembro: phoneNumber
    };

    console.log('📱 Reenviando notificación de WhatsApp a Bird CRM:', notificationData);

    // Enviar notificación
    const result = await sendEventRegistrationNotification(notificationData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notificación enviada exitosamente',
        data: {
          phone: phoneNumber,
          event: event.name || event.nombre,
          transaction: transaction.orderId
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al enviar la notificación',
          details: result.error
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error al reenviar notificación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar la solicitud',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
