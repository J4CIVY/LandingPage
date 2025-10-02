import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BoldTransaction, { TransactionStatus } from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';
import {
  generateBoldOrderId,
  generateBoldIntegrityHash,
  validateBoldPaymentConfig,
  formatBoldAmount,
  calculateBoldExpirationDate,
  generateBoldRedirectUrls,
  BOLD_CONFIG,
  type BoldPaymentConfig
} from '@/lib/bold-utils';

/**
 * Crea una nueva transacción Bold para el pago de un evento
 * POST /api/bold/transactions/create
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID del evento es requerido',
          error: 'MISSING_EVENT_ID'
        },
        { status: 400 }
      );
    }

    // Buscar el evento
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verificar que el evento tenga precio
    if (!event.price || event.price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Este evento no requiere pago',
          error: 'EVENT_IS_FREE'
        },
        { status: 400 }
      );
    }

    // Verificar cupos disponibles
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return NextResponse.json(
        {
          success: false,
          message: 'No hay cupos disponibles para este evento',
          error: 'EVENT_FULL'
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe una transacción aprobada para este usuario y evento
    const existingTransaction = await BoldTransaction.findOne({
      userId: authResult.user.id,
      eventId: eventId,
      status: TransactionStatus.APPROVED
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ya tienes un pago aprobado para este evento',
          error: 'PAYMENT_ALREADY_EXISTS'
        },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const user = await User.findById(authResult.user.id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Generar ID único de orden
    const orderId = generateBoldOrderId('EVT');

    // Formatear monto (Bold requiere sin decimales)
    const amount = formatBoldAmount(event.price);

    // Calcular subtotal e impuesto si aplica
    // Asumimos IVA del 19% incluido
    const taxRate = 19;
    const baseAmount = Math.round(amount / (1 + taxRate / 100));
    const taxAmount = amount - baseAmount;

    // Generar hash de integridad
    const integritySignature = generateBoldIntegrityHash(
      orderId,
      amount,
      BOLD_CONFIG.DEFAULT_CURRENCY
    );

    // Generar URLs de redirección
    const { redirectionUrl, originUrl } = generateBoldRedirectUrls(eventId, orderId);

    // Calcular fecha de expiración (24 horas)
    const expirationDate = calculateBoldExpirationDate(24);

    // Preparar descripción
    const description = `Inscripción a ${event.name}`.substring(0, 100);

    // Preparar datos del cliente
    const customerData = {
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone || '',
      dialCode: '+57',
      documentNumber: user.documentNumber || '',
      documentType: (user.documentType || 'CC') as 'CC' | 'CE' | 'PA' | 'NIT' | 'TI'
    };

    // Crear configuración de pago
    const paymentConfig: BoldPaymentConfig = {
      orderId,
      amount,
      currency: BOLD_CONFIG.DEFAULT_CURRENCY,
      description,
      tax: 'vat-19',
      redirectionUrl,
      originUrl,
      expirationDate,
      customerData,
      extraData1: `eventId:${eventId}`,
      extraData2: `userId:${user._id}`
    };

    // Validar configuración
    validateBoldPaymentConfig(paymentConfig);

    // Crear transacción en la base de datos
    const transaction = new BoldTransaction({
      orderId,
      eventId: event._id,
      eventName: event.name,
      userId: user._id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      amount,
      subtotal: baseAmount,
      tax: taxAmount,
      taxType: 'vat-19',
      currency: BOLD_CONFIG.DEFAULT_CURRENCY,
      description,
      status: TransactionStatus.PENDING,
      integritySignature,
      redirectionUrl,
      originUrl,
      payerData: {
        email: customerData.email,
        fullName: customerData.fullName,
        phone: customerData.phone,
        documentNumber: customerData.documentNumber,
        documentType: customerData.documentType
      },
      extraData1: paymentConfig.extraData1,
      extraData2: paymentConfig.extraData2
    });

    await transaction.save();

    // Retornar configuración para el cliente
    return NextResponse.json(
      {
        success: true,
        message: 'Transacción creada exitosamente',
        data: {
          transaction: {
            id: transaction._id,
            orderId: transaction.orderId,
            amount: transaction.amount,
            currency: transaction.currency,
            description: transaction.description,
            status: transaction.status
          },
          paymentConfig,
          integritySignature
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating Bold transaction:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
