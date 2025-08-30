import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  longDescription?: string;
  mainImage: string;
  gallery?: string[];
  eventType: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  departureLocation?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  arrivalLocation?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline?: Date;
  price?: number;
  includedServices?: string[];
  requirements?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  distance?: number; // en kilómetros
  duration?: number; // en horas
  organizer: {
    name: string;
    phone: string;
    email: string;
  };
  participants?: mongoose.Types.ObjectId[];
  tags?: string[];
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true, maxlength: 1000 },
  longDescription: { type: String, maxlength: 5000 },
  mainImage: { type: String, required: true },
  gallery: [{ type: String }],
  eventType: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  departureLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  arrivalLocation: {
    address: { type: String },
    city: { type: String },
    country: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  maxParticipants: { type: Number, min: 1 },
  currentParticipants: { type: Number, default: 0, min: 0 },
  registrationDeadline: { type: Date },
  price: { type: Number, min: 0, default: 0 },
  includedServices: [{ type: String, trim: true }],
  requirements: [{ type: String, trim: true }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  distance: { type: Number, min: 0 },
  duration: { type: Number, min: 0 },
  organizer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'events'
});

// Índices para optimizar consultas
EventSchema.index({ name: 'text', description: 'text', eventType: 'text' });
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ 'departureLocation.city': 1 });
EventSchema.index({ difficulty: 1 });
EventSchema.index({ isActive: 1 });

// Validación personalizada para fechas
EventSchema.pre('save', function(next) {
  // Validar que la fecha de inicio sea futura (solo para eventos nuevos)
  if (this.isNew && this.startDate <= new Date()) {
    next(new Error('La fecha de inicio debe ser futura'));
    return;
  }
  
  // Validar que la fecha de fin sea después de la de inicio
  if (this.endDate && this.endDate <= this.startDate) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
    return;
  }
  
  // Validar que la fecha límite de registro sea antes del evento
  if (this.registrationDeadline && this.registrationDeadline >= this.startDate) {
    next(new Error('La fecha límite de registro debe ser anterior al evento'));
    return;
  }
  
  // Validar que no exceda el máximo de participantes
  if (this.maxParticipants && this.currentParticipants > this.maxParticipants) {
    next(new Error('El número de participantes actuales no puede exceder el máximo'));
    return;
  }
  
  next();
});

// Método virtual para verificar si el evento está lleno
EventSchema.virtual('isFull').get(function() {
  return this.maxParticipants !== undefined && 
         this.currentParticipants >= this.maxParticipants;
});

// Método virtual para verificar si el registro está abierto
EventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const registrationDeadline = this.registrationDeadline || this.startDate;
  const isFull = this.maxParticipants !== undefined && 
                 this.currentParticipants >= this.maxParticipants;
  return now < registrationDeadline && 
         this.status === 'published' && 
         !isFull;
});

// Método virtual para verificar si el evento ya pasó
EventSchema.virtual('isPast').get(function() {
  return this.endDate ? new Date() > this.endDate : new Date() > this.startDate;
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
