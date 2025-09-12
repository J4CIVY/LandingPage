import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipHistory extends Document {
  // Referencia al usuario
  userId: mongoose.Types.ObjectId;
  
  // Información de la membresía
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  membershipNumber: string;
  
  // Vigencia
  startDate: Date;
  endDate: Date;
  duration: number; // En días
  
  // Estado
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  isAutoRenewal: boolean;
  
  // Información de pago
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'crypto' | 'other';
  paymentProvider?: string;
  transactionId?: string;
  paymentDate: Date;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  
  // Información de facturación
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  taxAmount?: number;
  
  // Proceso de renovación/upgrade/downgrade
  previousMembershipType?: string;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isRenewal: boolean;
  renewalSource: 'manual' | 'auto' | 'admin' | 'promotion';
  
  // Descuentos y promociones
  discountApplied?: {
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    description: string;
  };
  promotionId?: mongoose.Types.ObjectId;
  
  // Cancelación
  cancellationDate?: Date;
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId; // Usuario o admin que canceló
  refundAmount?: number;
  refundDate?: Date;
  
  // Suspensión
  suspensionDate?: Date;
  suspensionReason?: string;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionEndDate?: Date;
  
  // Beneficios otorgados durante esta membresía
  benefitsGranted?: mongoose.Types.ObjectId[];
  benefitsUsed?: Array<{
    benefitId: mongoose.Types.ObjectId;
    usedAt: Date;
    location?: string;
  }>;
  
  // Estadísticas de uso
  eventsAttended: number;
  lastActivity?: Date;
  totalSavings?: number; // Ahorros por beneficios usados
  
  // Notas administrativas
  adminNotes?: string;
  internalNotes?: string;
  
  // Metadatos
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  isCurrentlyActive(): boolean;
  getDaysRemaining(): number;
  getTotalSavings(): number;
  canBeRenewed(): boolean;
}

const MembershipHistorySchema = new Schema<IMembershipHistory>({
  // Referencia al usuario
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Información de la membresía
  membershipType: { 
    type: String, 
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'],
    required: true,
    index: true
  },
  membershipNumber: { type: String, required: true, trim: true, index: true },
  
  // Vigencia
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true, index: true },
  duration: { type: Number, required: true, min: 1 }, // En días
  
  // Estado
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending', 'suspended'],
    default: 'pending',
    index: true
  },
  isAutoRenewal: { type: Boolean, default: false },
  
  // Información de pago
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'COP', uppercase: true },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'paypal', 'crypto', 'other'],
    required: true
  },
  paymentProvider: { type: String, trim: true },
  transactionId: { type: String, trim: true, index: true },
  paymentDate: { type: Date, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Información de facturación
  invoiceNumber: { type: String, trim: true, unique: true, sparse: true },
  invoiceUrl: { type: String, trim: true },
  receiptUrl: { type: String, trim: true },
  taxAmount: { type: Number, min: 0 },
  
  // Proceso de renovación/upgrade/downgrade
  previousMembershipType: { 
    type: String, 
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo']
  },
  isUpgrade: { type: Boolean, default: false },
  isDowngrade: { type: Boolean, default: false },
  isRenewal: { type: Boolean, default: false },
  renewalSource: {
    type: String,
    enum: ['manual', 'auto', 'admin', 'promotion'],
    default: 'manual'
  },
  
  // Descuentos y promociones
  discountApplied: {
    code: { type: String, trim: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed_amount'] },
    value: { type: Number, min: 0 },
    description: { type: String, trim: true }
  },
  promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
  
  // Cancelación
  cancellationDate: { type: Date },
  cancellationReason: { type: String, trim: true, maxlength: 500 },
  cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  refundAmount: { type: Number, min: 0 },
  refundDate: { type: Date },
  
  // Suspensión
  suspensionDate: { type: Date },
  suspensionReason: { type: String, trim: true, maxlength: 500 },
  suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  suspensionEndDate: { type: Date },
  
  // Beneficios otorgados durante esta membresía
  benefitsGranted: [{ type: Schema.Types.ObjectId, ref: 'Benefit' }],
  benefitsUsed: [{
    benefitId: { type: Schema.Types.ObjectId, ref: 'Benefit', required: true },
    usedAt: { type: Date, default: Date.now },
    location: { type: String, trim: true }
  }],
  
  // Estadísticas de uso
  eventsAttended: { type: Number, default: 0, min: 0 },
  lastActivity: { type: Date },
  totalSavings: { type: Number, default: 0, min: 0 },
  
  // Notas administrativas
  adminNotes: { type: String, trim: true, maxlength: 2000 },
  internalNotes: { type: String, trim: true, maxlength: 2000 },
  
  // Metadatos
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  collection: 'membership_history',
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      delete ret.__v;
      delete ret.internalNotes;
      return ret;
    }
  }
});

// Índices adicionales para optimizar consultas
MembershipHistorySchema.index({ userId: 1, status: 1 });
MembershipHistorySchema.index({ startDate: 1, endDate: 1 });
MembershipHistorySchema.index({ paymentStatus: 1, paymentDate: -1 });
MembershipHistorySchema.index({ membershipType: 1, createdAt: -1 });
MembershipHistorySchema.index({ isAutoRenewal: 1, endDate: 1 });
MembershipHistorySchema.index({ createdAt: -1 });

// Virtual para verificar si está actualmente activa
MembershipHistorySchema.virtual('isActive').get(function(this: IMembershipHistory) {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         this.paymentStatus === 'completed';
});

// Virtual para días restantes
MembershipHistorySchema.virtual('daysRemaining').get(function(this: IMembershipHistory) {
  if (this.status !== 'active') return 0;
  
  const now = new Date();
  const timeDiff = this.endDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff);
});

// Método para verificar si está actualmente activa
MembershipHistorySchema.methods.isCurrentlyActive = function(this: IMembershipHistory): boolean {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         this.paymentStatus === 'completed';
};

// Método para obtener días restantes
MembershipHistorySchema.methods.getDaysRemaining = function(this: IMembershipHistory): number {
  if (this.status !== 'active') return 0;
  
  const now = new Date();
  const timeDiff = this.endDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff);
};

// Método para calcular ahorros totales
MembershipHistorySchema.methods.getTotalSavings = function(this: IMembershipHistory): number {
  return this.totalSavings || 0;
};

// Método para verificar si puede ser renovada
MembershipHistorySchema.methods.canBeRenewed = function(this: IMembershipHistory): boolean {
  const now = new Date();
  const daysUntilExpiry = this.getDaysRemaining();
  
  // Puede renovar si está activa y faltan menos de 30 días o ya expiró
  return (this.status === 'active' && daysUntilExpiry <= 30) || 
         (this.status === 'expired' && this.endDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)); // Hasta 90 días después de expirar
};

// Middleware para generar número de factura
MembershipHistorySchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber && this.paymentStatus === 'completed') {
    const count = await (this.constructor as any).countDocuments();
    this.invoiceNumber = `BSK-INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Actualizar el estado basado en las fechas
  if (this.isModified('endDate') || this.isModified('startDate')) {
    const now = new Date();
    if (this.endDate < now && this.status === 'active') {
      this.status = 'expired';
    }
  }
  
  next();
});

// Middleware para calcular duración automáticamente
MembershipHistorySchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  next();
});

export default mongoose.models.MembershipHistory || mongoose.model<IMembershipHistory>('MembershipHistory', MembershipHistorySchema);