import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergency extends Document {
  name: string;
  memberId: string;
  memberRef?: mongoose.Types.ObjectId;
  emergencyType: 'mechanical' | 'medical' | 'accident' | 'breakdown' | 'other';
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  alternativeContact?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  resolution?: string;
  responseTime?: Date; // Cuando se asignó o comenzó a atender
  resolutionTime?: Date; // Cuando se resolvió
  estimatedArrival?: Date;
  actualArrival?: Date;
  servicesProvided?: string[];
  cost?: number;
  notes?: string[];
  attachments?: string[]; // URLs de fotos, documentos, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencySchema = new Schema<IEmergency>({
  name: { type: String, required: true, trim: true },
  memberId: { type: String, required: true },
  memberRef: { type: Schema.Types.ObjectId, ref: 'User' },
  emergencyType: {
    type: String,
    enum: ['mechanical', 'medical', 'accident', 'breakdown', 'other'],
    required: true
  },
  description: { type: String, required: true, maxlength: 1000 },
  location: { type: String, required: true, maxlength: 500 },
  coordinates: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 }
  },
  contactPhone: { type: String, required: true },
  alternativeContact: { type: String },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String },
  resolution: { type: String, maxlength: 1000 },
  responseTime: { type: Date },
  resolutionTime: { type: Date },
  estimatedArrival: { type: Date },
  actualArrival: { type: Date },
  servicesProvided: [{ type: String, trim: true }],
  cost: { type: Number, min: 0 },
  notes: [{ type: String, maxlength: 500 }],
  attachments: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'emergencies'
});

// Índices para optimizar consultas
EmergencySchema.index({ status: 1 });
EmergencySchema.index({ priority: 1 });
EmergencySchema.index({ emergencyType: 1 });
EmergencySchema.index({ memberId: 1 });
EmergencySchema.index({ assignedTo: 1 });
EmergencySchema.index({ createdAt: -1 });
EmergencySchema.index({ coordinates: '2dsphere' }); // Para búsquedas geoespaciales

// Middleware para actualizar tiempos automáticamente
EmergencySchema.pre('save', function(next) {
  // Establecer tiempo de respuesta cuando se asigna por primera vez
  if (this.isModified('assignedTo') && this.assignedTo && !this.responseTime) {
    this.responseTime = new Date();
  }
  
  // Establecer tiempo de resolución cuando se resuelve
  if (this.isModified('status') && 
      (this.status === 'resolved' || this.status === 'cancelled') && 
      !this.resolutionTime) {
    this.resolutionTime = new Date();
  }
  
  // Cambiar a "en progreso" cuando se asigna
  if (this.isModified('assignedTo') && this.assignedTo && this.status === 'pending') {
    this.status = 'in-progress';
  }
  
  next();
});

// Método virtual para calcular tiempo de respuesta
EmergencySchema.virtual('responseTimeMinutes').get(function() {
  if (this.responseTime && this.createdAt) {
    return Math.round((this.responseTime.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }
  return null;
});

// Método virtual para calcular tiempo total de resolución
EmergencySchema.virtual('totalResolutionTimeMinutes').get(function() {
  if (this.resolutionTime && this.createdAt) {
    return Math.round((this.resolutionTime.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }
  return null;
});

// Método virtual para verificar si está vencida (más de 2 horas sin resolver para críticas)
EmergencySchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'cancelled') {
    return false;
  }
  
  const now = new Date();
  const hoursSinceCreated = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
  
  switch (this.priority) {
    case 'critical':
      return hoursSinceCreated > 2;
    case 'high':
      return hoursSinceCreated > 4;
    case 'medium':
      return hoursSinceCreated > 8;
    case 'low':
      return hoursSinceCreated > 24;
    default:
      return false;
  }
});

export default mongoose.models.Emergency || mongoose.model<IEmergency>('Emergency', EmergencySchema);
