import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipApplication extends Document {
  name: string;
  email: string;
  phone: string;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  
  // Información adicional del solicitante
  age?: number;
  city?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  ridingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Seguimiento de la aplicación
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  reviewDate?: Date;
  rejectionReason?: string;
  approvalNotes?: string;
  
  // Proceso de incorporación
  orientationCompleted?: boolean;
  orientationDate?: Date;
  membershipStartDate?: Date;
  membershipNumber?: string;
  
  // Referencias
  referredBy?: string;
  referredByMember?: mongoose.Types.ObjectId;
  
  // Comunicación
  communicationHistory?: Array<{
    date: Date;
    type: 'email' | 'phone' | 'whatsapp' | 'in-person';
    description: string;
    performedBy: string;
  }>;
  
  // Metadatos
  source?: 'website' | 'referral' | 'event' | 'social-media' | 'other';
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipApplicationSchema = new Schema<IMembershipApplication>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  membershipType: {
    type: String,
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'],
    required: true
  },
  message: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Información adicional del solicitante
  age: { type: Number, min: 16, max: 100 },
  city: { type: String, trim: true },
  motorcycleBrand: { type: String, trim: true },
  motorcycleModel: { type: String, trim: true },
  ridingExperience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  
  // Seguimiento de la aplicación
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedByName: { type: String },
  reviewDate: { type: Date },
  rejectionReason: { type: String, maxlength: 500 },
  approvalNotes: { type: String, maxlength: 500 },
  
  // Proceso de incorporación
  orientationCompleted: { type: Boolean, default: false },
  orientationDate: { type: Date },
  membershipStartDate: { type: Date },
  membershipNumber: { type: String },
  
  // Referencias
  referredBy: { type: String, trim: true },
  referredByMember: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Comunicación
  communicationHistory: [{
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'in-person'],
      required: true
    },
    description: { type: String, required: true, maxlength: 500 },
    performedBy: { type: String, required: true }
  }],
  
  // Metadatos
  source: {
    type: String,
    enum: ['website', 'referral', 'event', 'social-media', 'other'],
    default: 'website'
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'membership_applications'
});

// Índices para optimizar consultas
MembershipApplicationSchema.index({ email: 1 });
MembershipApplicationSchema.index({ status: 1 });
MembershipApplicationSchema.index({ membershipType: 1 });
MembershipApplicationSchema.index({ createdAt: -1 });
MembershipApplicationSchema.index({ reviewDate: 1 });
MembershipApplicationSchema.index({ city: 1 });

// Validación para evitar aplicaciones duplicadas
MembershipApplicationSchema.index({ email: 1, status: 1 });

// Middleware para validaciones
MembershipApplicationSchema.pre('save', function(next) {
  // Si se aprueba, establecer fecha de revisión
  if (this.isModified('status') && this.status === 'approved' && !this.reviewDate) {
    this.reviewDate = new Date();
  }
  
  // Si se rechaza, establecer fecha de revisión
  if (this.isModified('status') && this.status === 'rejected' && !this.reviewDate) {
    this.reviewDate = new Date();
  }
  
  // Generar número de membresía cuando se aprueba
  if (this.isModified('status') && this.status === 'approved' && !this.membershipNumber) {
    // Se generará en el hook post-save para tener acceso a métodos estáticos
  }
  
  next();
});

// Middleware post-save para generar número de membresía
MembershipApplicationSchema.post('save', async function(doc) {
  if (doc.status === 'approved' && !doc.membershipNumber) {
    const MembershipApplication = mongoose.model<IMembershipApplication>('MembershipApplication');
    const totalApproved = await MembershipApplication.countDocuments({ status: 'approved' });
    doc.membershipNumber = `BSK${String(totalApproved).padStart(6, '0')}`;
    doc.membershipStartDate = new Date();
    await doc.save();
  }
});

// Método virtual para calcular tiempo de procesamiento
MembershipApplicationSchema.virtual('processingDays').get(function() {
  if (this.reviewDate) {
    const diffTime = Math.abs(this.reviewDate.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Método virtual para verificar si está pendiente por mucho tiempo
MembershipApplicationSchema.virtual('isPendingTooLong').get(function() {
  if (this.status !== 'pending') return false;
  
  const now = new Date();
  const daysSinceCreated = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreated > 7; // Más de 7 días pendiente
});

// Método para agregar nota de comunicación
MembershipApplicationSchema.methods.addCommunication = function(
  type: 'email' | 'phone' | 'whatsapp' | 'in-person',
  description: string,
  performedBy: string
) {
  if (!this.communicationHistory) {
    this.communicationHistory = [];
  }
  
  this.communicationHistory.push({
    date: new Date(),
    type,
    description,
    performedBy
  });
  
  return this.save();
};

export default mongoose.models.MembershipApplication || 
                mongoose.model<IMembershipApplication>('MembershipApplication', MembershipApplicationSchema);
