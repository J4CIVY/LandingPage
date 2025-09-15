import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para los beneficios de la membresía
export interface IMembershipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'events' | 'support' | 'commercial' | 'digital' | 'emergency' | 'education' | 'social';
  isActive: boolean;
  priority: number; // Para ordenar por importancia
}

// Interfaz para las tarifas
export interface IMembershipPricing {
  initial: number; // Precio inicial en pesos colombianos
  withDiscount?: number; // Precio con descuento (opcional)
  early_bird?: number; // Precio especial por renovación temprana
  student?: number; // Precio para estudiantes (opcional)
  family?: number; // Precio para plan familiar (opcional)
  corporate?: number; // Precio corporativo (opcional)
}

// Interfaz para el periodo de vigencia
export interface IMembershipPeriod {
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  renewalStartDate?: Date; // Cuándo pueden empezar a renovar
  renewalDeadline?: Date; // Fecha límite para renovar
}

// Tipos de renovación
export type RenewalType = 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'lifetime';

// Interfaz principal de la membresía
export interface IMembership extends Document {
  name: string;
  slug: string; // Para URLs amigables
  description: string;
  shortDescription?: string; // Descripción corta para cards
  
  // Información de precios
  pricing: IMembershipPricing;
  
  // Vigencia y renovación
  period: IMembershipPeriod;
  requiresRenewal: boolean;
  renewalType?: RenewalType;
  isLifetime: boolean; // Si es vitalicia pero con renovaciones anuales
  
  // Estado
  status: 'active' | 'inactive' | 'draft' | 'archived';
  
  // Beneficios
  benefits: IMembershipBenefit[];
  
  // Información adicional
  information: {
    targetAudience?: string; // A quién está dirigida
    requirements?: string[]; // Requisitos para obtenerla
    commitment?: string[]; // Compromisos del miembro
    support?: {
      email?: string;
      whatsapp?: string;
      phone?: string;
      emergencyLine?: string;
    };
  };
  
  // Niveles (si maneja jerarquías)
  level: {
    tier: number; // 1 = básico, 2 = intermedio, 3 = premium, etc.
    name: string; // Nombre del nivel (Friend, Rider, Pro, Elite, VIP, etc.)
    upgradeRequirements?: string[]; // Qué se necesita para subir de nivel
  };
  
  // Proceso de inscripción
  enrollmentProcess?: {
    steps: string[];
    requiredDocuments?: string[];
    minimumAge?: number;
    requiresVehicle?: boolean;
    autoApproval?: boolean;
  };
  
  // Configuración de renovación automática
  autoRenewal: {
    enabled: boolean;
    notificationDays: number[]; // Días antes del vencimiento para notificar [30, 15, 7, 1]
    gracePeriodDays?: number; // Días de gracia después del vencimiento
  };
  
  // Límites y capacidad
  capacity?: {
    maxMembers?: number;
    currentMembers?: number;
    waitingList?: boolean;
  };
  
  // Testimonios
  testimonials?: {
    author: string;
    comment: string;
    rating?: number;
    date?: Date;
  }[];
  
  // Metadatos
  createdBy: mongoose.Types.ObjectId; // Usuario admin que la creó
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  // SEO y marketing
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  
  // Configuración de visualización
  display: {
    color: string; // Color principal de la membresía
    icon?: string; // Ícono representativo
    featured: boolean; // Si se destaca en la página principal
    order: number; // Orden de visualización
    showInPublic: boolean; // Si se muestra en páginas públicas
  };
}

const MembershipBenefitSchema = new Schema<IMembershipBenefit>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['events', 'support', 'commercial', 'digital', 'emergency', 'education', 'social'],
    required: true 
  },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }
});

const MembershipPricingSchema = new Schema<IMembershipPricing>({
  initial: { type: Number, required: true, min: 0 },
  withDiscount: { type: Number, min: 0 },
  early_bird: { type: Number, min: 0 },
  student: { type: Number, min: 0 },
  family: { type: Number, min: 0 },
  corporate: { type: Number, min: 0 }
});

const MembershipPeriodSchema = new Schema<IMembershipPeriod>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  renewalStartDate: { type: Date },
  renewalDeadline: { type: Date }
});

const MembershipSchema = new Schema<IMembership>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000 
  },
  shortDescription: { 
    type: String,
    maxlength: 200 
  },
  
  pricing: MembershipPricingSchema,
  period: MembershipPeriodSchema,
  
  requiresRenewal: { type: Boolean, default: true },
  renewalType: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'biannual', 'annual', 'lifetime'],
    default: 'annual'
  },
  isLifetime: { type: Boolean, default: false },
  
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft', 'archived'], 
    default: 'draft' 
  },
  
  benefits: [MembershipBenefitSchema],
  
  information: {
    targetAudience: { type: String },
    requirements: [{ type: String }],
    commitment: [{ type: String }],
    support: {
      email: { type: String },
      whatsapp: { type: String },
      phone: { type: String },
      emergencyLine: { type: String }
    }
  },
  
  level: {
    tier: { type: Number, required: true, min: 1, max: 10 },
    name: { type: String, required: true },
    upgradeRequirements: [{ type: String }]
  },
  
  enrollmentProcess: {
    steps: [{ type: String }],
    requiredDocuments: [{ type: String }],
    minimumAge: { type: Number, min: 0, max: 100 },
    requiresVehicle: { type: Boolean, default: false },
    autoApproval: { type: Boolean, default: false }
  },
  
  autoRenewal: {
    enabled: { type: Boolean, default: true },
    notificationDays: [{ type: Number }],
    gracePeriodDays: { type: Number, default: 7 }
  },
  
  capacity: {
    maxMembers: { type: Number, min: 1 },
    currentMembers: { type: Number, default: 0 },
    waitingList: { type: Boolean, default: false }
  },
  
  testimonials: [{
    author: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    date: { type: Date, default: Date.now }
  }],
  
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lastModifiedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }]
  },
  
  display: {
    color: { type: String, default: '#3B82F6' },
    icon: { type: String },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    showInPublic: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
MembershipSchema.index({ slug: 1 });
MembershipSchema.index({ status: 1 });
MembershipSchema.index({ 'level.tier': 1 });
MembershipSchema.index({ 'display.featured': 1, 'display.order': 1 });
MembershipSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

// Virtual para calcular si está en periodo de renovación
MembershipSchema.virtual('isInRenewalPeriod').get(function() {
  if (!this.period.renewalStartDate || !this.period.renewalDeadline) return false;
  const now = new Date();
  return now >= this.period.renewalStartDate && now <= this.period.renewalDeadline;
});

// Virtual para calcular días restantes
MembershipSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.period.endDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Middleware para generar slug automáticamente
MembershipSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Middleware para actualizar lastModifiedBy
MembershipSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);