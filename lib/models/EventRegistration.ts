import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  registrationDate: Date;
  status: 'active' | 'cancelled';
  registrationNumber: string; // Número único de registro
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para búsquedas eficientes
EventRegistrationSchema.index({ userId: 1, eventId: 1 });

// Método estático para generar número de registro único
EventRegistrationSchema.statics.generateRegistrationNumber = function(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REG-${timestamp}-${random}`;
};

const EventRegistration = mongoose.models.EventRegistration || 
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export default EventRegistration;
