import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Estados de la transacción Bold
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  CANCELLED = 'CANCELLED',
  NO_TRANSACTION_FOUND = 'NO_TRANSACTION_FOUND'
}

/**
 * Métodos de pago Bold
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PSE = 'PSE',
  NEQUI = 'NEQUI',
  BANCOLOMBIA_BUTTON = 'BANCOLOMBIA_BUTTON',
  CASH = 'CASH'
}

/**
 * Interfaz para el documento de transacción Bold
 */
export interface IBoldTransaction extends Document {
  // Identificadores
  orderId: string; // ID de la orden en nuestro sistema
  boldTransactionId?: string; // ID de transacción en Bold
  boldLinkId?: string; // ID del link de pago en Bold
  
  // Información del evento
  eventId: mongoose.Types.ObjectId;
  eventName: string;
  
  // Información del usuario
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  
  // Datos de la transacción
  amount: number; // Monto total
  subtotal: number; // Subtotal sin impuestos
  tax?: number; // Impuesto aplicado
  taxType?: string; // Tipo de impuesto (vat-19, etc)
  currency: string; // COP o USD
  description: string;
  
  // Estado
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  
  // Información del pago
  paymentDate?: Date; // Fecha en que se aprobó el pago
  transactionDate?: Date; // Fecha de la transacción en Bold
  
  // Hash de integridad
  integritySignature: string;
  
  // Token de acceso público para ver factura
  accessToken?: string;
  
  // URLs
  redirectionUrl?: string;
  originUrl?: string;
  
  // Datos adicionales del pagador
  payerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
    documentNumber?: string;
    documentType?: string;
  };
  
  // Datos de ubicación
  billingAddress?: {
    address?: string;
    city?: string;
    zipCode?: string;
    state?: string;
    country?: string;
  };
  
  // Datos extra
  extraData1?: string;
  extraData2?: string;
  
  // Respuesta completa del webhook de Bold
  boldWebhookData?: any;
  
  // Metadata
  attemptCount: number; // Número de intentos de pago
  lastAttemptDate?: Date;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instancia
  markAsApproved(boldData: any): Promise<void>;
  markAsRejected(boldData: any): Promise<void>;
  markAsFailed(boldData: any): Promise<void>;
  incrementAttempts(): Promise<void>;
}

/**
 * Schema de transacción Bold
 */
const BoldTransactionSchema = new Schema<IBoldTransaction>(
  {
    // Identificadores
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxlength: 60
    },
    boldTransactionId: {
      type: String,
      index: true,
      sparse: true
    },
    boldLinkId: {
      type: String,
      index: true
    },
    
    // Información del evento
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    eventName: {
      type: String,
      required: true
    },
    
    // Información del usuario
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    
    // Datos de la transacción
    amount: {
      type: Number,
      required: true,
      min: 1000
    },
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      min: 0
    },
    taxType: {
      type: String
    },
    currency: {
      type: String,
      required: true,
      enum: ['COP', 'USD'],
      default: 'COP'
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100
    },
    
    // Estado
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod)
    },
    
    // Información del pago
    paymentDate: {
      type: Date
    },
    transactionDate: {
      type: Date
    },
    
    // Hash de integridad
    integritySignature: {
      type: String,
      required: true
    },
    
    // Token de acceso público para ver factura
    accessToken: {
      type: String,
      unique: true,
      sparse: true,
      select: false
    },
    
    // URLs
    redirectionUrl: {
      type: String
    },
    originUrl: {
      type: String
    },
    
    // Datos adicionales del pagador
    payerData: {
      email: String,
      fullName: String,
      phone: String,
      documentNumber: String,
      documentType: String
    },
    
    // Datos de ubicación
    billingAddress: {
      address: String,
      city: String,
      zipCode: String,
      state: String,
      country: String
    },
    
    // Datos extra
    extraData1: {
      type: String,
      maxlength: 60
    },
    extraData2: {
      type: String,
      maxlength: 60
    },
    
    // Respuesta completa del webhook de Bold
    boldWebhookData: {
      type: Schema.Types.Mixed
    },
    
    // Metadata
    attemptCount: {
      type: Number,
      default: 0
    },
    lastAttemptDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'boldtransactions'
  }
);

// Índices compuestos
BoldTransactionSchema.index({ userId: 1, status: 1 });
BoldTransactionSchema.index({ eventId: 1, status: 1 });
BoldTransactionSchema.index({ createdAt: -1 });

/**
 * Marca la transacción como aprobada
 */
BoldTransactionSchema.methods.markAsApproved = async function(boldData: any): Promise<void> {
  this.status = TransactionStatus.APPROVED;
  this.paymentDate = new Date();
  this.boldTransactionId = boldData.transaction_id || boldData.transactionId;
  this.paymentMethod = boldData.payment_method || boldData.paymentMethod;
  this.transactionDate = boldData.transaction_date 
    ? new Date(boldData.transaction_date) 
    : new Date();
  this.boldWebhookData = boldData;
  
  await this.save();
};

/**
 * Marca la transacción como rechazada
 */
BoldTransactionSchema.methods.markAsRejected = async function(boldData: any): Promise<void> {
  this.status = TransactionStatus.REJECTED;
  this.boldTransactionId = boldData.transaction_id || boldData.transactionId;
  this.paymentMethod = boldData.payment_method || boldData.paymentMethod;
  this.transactionDate = boldData.transaction_date 
    ? new Date(boldData.transaction_date) 
    : new Date();
  this.boldWebhookData = boldData;
  
  await this.save();
};

/**
 * Marca la transacción como fallida
 */
BoldTransactionSchema.methods.markAsFailed = async function(boldData: any): Promise<void> {
  this.status = TransactionStatus.FAILED;
  this.boldTransactionId = boldData.transaction_id || boldData.transactionId;
  this.paymentMethod = boldData.payment_method || boldData.paymentMethod;
  this.transactionDate = boldData.transaction_date 
    ? new Date(boldData.transaction_date) 
    : new Date();
  this.boldWebhookData = boldData;
  
  await this.save();
};

/**
 * Incrementa el contador de intentos
 */
BoldTransactionSchema.methods.incrementAttempts = async function(): Promise<void> {
  this.attemptCount += 1;
  this.lastAttemptDate = new Date();
  await this.save();
};

// Evitar recompilación del modelo en desarrollo
const BoldTransaction: Model<IBoldTransaction> = 
  mongoose.models.BoldTransaction || 
  mongoose.model<IBoldTransaction>('BoldTransaction', BoldTransactionSchema);

export default BoldTransaction;
