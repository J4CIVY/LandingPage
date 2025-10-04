import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Estado de la solicitud
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  // Aceptación de documentos legales
  acceptedTerms: boolean;
  acceptedEthicsCode: boolean;
  acceptedDataProcessing: boolean;
  acceptedVolunteerAgreement: boolean;
  
  // Timestamps de lectura de documentos (para verificar que leyó hasta el final)
  termsReadAt?: Date;
  ethicsCodeReadAt?: Date;
  dataProcessingReadAt?: Date;
  volunteerAgreementReadAt?: Date;
  
  // Información de revisión (por admin)
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  
  // Metadatos
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  
  // Aceptación de documentos
  acceptedTerms: { type: Boolean, required: true, default: false },
  acceptedEthicsCode: { type: Boolean, required: true, default: false },
  acceptedDataProcessing: { type: Boolean, required: true, default: false },
  acceptedVolunteerAgreement: { type: Boolean, required: true, default: false },
  
  // Timestamps de lectura
  termsReadAt: { type: Date },
  ethicsCodeReadAt: { type: Date },
  dataProcessingReadAt: { type: Date },
  volunteerAgreementReadAt: { type: Date },
  
  // Información de revisión
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },
  
  // Metadatos
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'volunteer_applications'
});

// Índices compuestos para consultas comunes
VolunteerApplicationSchema.index({ userId: 1, status: 1 });
VolunteerApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.VolunteerApplication || 
  mongoose.model<IVolunteerApplication>('VolunteerApplication', VolunteerApplicationSchema);
