import mongoose, { Schema, Document } from 'mongoose';

export interface IBenefit extends Document {
  // Información básica del beneficio
  title: string;
  description: string;
  detailedDescription?: string;
  icon: string;
  category: 'events' | 'support' | 'commercial' | 'social' | 'technical' | 'insurance';
  
  // Configuración de disponibilidad
  membershipTypes: ('friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo')[];
  isActive: boolean;
  isVisible: boolean;
  
  // Información del convenio/beneficio
  partnerName?: string;
  partnerLogo?: string;
  partnerContact?: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  
  // Detalles del descuento/beneficio
  discountType?: 'percentage' | 'fixed_amount' | 'free' | 'special_price';
  discountValue?: number;
  originalPrice?: number;
  specialPrice?: number;
  conditions?: string;
  limitations?: string;
  
  // Vigencia
  validFrom?: Date;
  validUntil?: Date;
  isTemporary: boolean;
  
  // Ubicación (si aplica)
  locations?: Array<{
    name: string;
    address: string;
    city: string;
    phone?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  
  // Proceso de redención
  redemptionProcess: string;
  requiresCode: boolean;
  redemptionCode?: string;
  requiresIdentification: boolean;
  
  // Estadísticas
  usageCount: number;
  maxUsagePerMember?: number;
  totalUsageLimit?: number;
  
  // Metadatos
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  isAvailableForMember(membershipType: string): boolean;
  isCurrentlyValid(): boolean;
  canBeUsed(): boolean;
}

const BenefitSchema = new Schema<IBenefit>({
  // Información básica del beneficio
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  detailedDescription: { type: String, trim: true, maxlength: 2000 },
  icon: { 
    type: String, 
    required: true,
    default: 'FaGift'
  },
  category: {
    type: String,
    enum: ['events', 'support', 'commercial', 'social', 'technical', 'insurance'],
    required: true,
    index: true
  },
  
  // Configuración de disponibilidad
  membershipTypes: [{
    type: String,
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'],
    required: true
  }],
  isActive: { type: Boolean, default: true, index: true },
  isVisible: { type: Boolean, default: true },
  
  // Información del convenio/beneficio
  partnerName: { type: String, trim: true },
  partnerLogo: { type: String, trim: true },
  partnerContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true }
  },
  
  // Detalles del descuento/beneficio
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free', 'special_price']
  },
  discountValue: { type: Number, min: 0 },
  originalPrice: { type: Number, min: 0 },
  specialPrice: { type: Number, min: 0 },
  conditions: { type: String, trim: true, maxlength: 1000 },
  limitations: { type: String, trim: true, maxlength: 1000 },
  
  // Vigencia
  validFrom: { type: Date },
  validUntil: { type: Date },
  isTemporary: { type: Boolean, default: false },
  
  // Ubicación (si aplica)
  locations: [{
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    }
  }],
  
  // Proceso de redención
  redemptionProcess: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 1000
  },
  requiresCode: { type: Boolean, default: false },
  redemptionCode: { type: String, trim: true, uppercase: true },
  requiresIdentification: { type: Boolean, default: true },
  
  // Estadísticas
  usageCount: { type: Number, default: 0, min: 0 },
  maxUsagePerMember: { type: Number, min: 1 },
  totalUsageLimit: { type: Number, min: 1 },
  
  // Metadatos
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  collection: 'benefits',
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      delete ret.__v;
      return ret;
    }
  }
});

// Índices adicionales para optimizar consultas
BenefitSchema.index({ category: 1, isActive: 1 });
BenefitSchema.index({ membershipTypes: 1, isActive: 1 });
BenefitSchema.index({ validFrom: 1, validUntil: 1 });
BenefitSchema.index({ partnerName: 1 });
BenefitSchema.index({ createdAt: -1 });

// Virtual para verificar si el beneficio está vigente
BenefitSchema.virtual('isValid').get(function(this: IBenefit) {
  if (!this.isTemporary) return true;
  
  const now = new Date();
  const validFrom = this.validFrom || new Date(0);
  const validUntil = this.validUntil || new Date('2099-12-31');
  
  return now >= validFrom && now <= validUntil;
});

// Método para verificar si está disponible para un tipo de membresía
BenefitSchema.methods.isAvailableForMember = function(this: IBenefit, membershipType: string): boolean {
  return this.isActive && this.isVisible && this.membershipTypes.includes(membershipType as any); // eslint-disable-line @typescript-eslint/no-explicit-any
};

// Método para verificar si está actualmente válido
BenefitSchema.methods.isCurrentlyValid = function(this: IBenefit): boolean {
  if (!this.isActive) return false;
  if (!this.isTemporary) return true;
  
  const now = new Date();
  const validFrom = this.validFrom || new Date(0);
  const validUntil = this.validUntil || new Date('2099-12-31');
  
  return now >= validFrom && now <= validUntil;
};

// Método para verificar si puede ser usado
BenefitSchema.methods.canBeUsed = function(this: IBenefit): boolean {
  if (!this.isCurrentlyValid()) return false;
  if (this.totalUsageLimit && this.usageCount >= this.totalUsageLimit) return false;
  
  return true;
};

// Middleware para validar datos antes de guardar
BenefitSchema.pre('save', function(next) {
  // Validar que si requiere código, el código esté presente
  if (this.requiresCode && !this.redemptionCode) {
    return next(new Error('Se requiere código de redención'));
  }
  
  // Validar fechas de vigencia
  if (this.validFrom && this.validUntil && this.validFrom > this.validUntil) {
    return next(new Error('La fecha de inicio no puede ser posterior a la fecha de fin'));
  }
  
  // Validar descuentos
  if (this.discountType === 'percentage' && this.discountValue && this.discountValue > 100) {
    return next(new Error('El descuento porcentual no puede ser mayor al 100%'));
  }
  
  next();
});

export default mongoose.models.Benefit || mongoose.model<IBenefit>('Benefit', BenefitSchema);