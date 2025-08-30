import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Información personal básica
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  
  // Información de contacto
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  neighborhood?: string;
  city: string;
  country: string;
  postalCode?: string;
  
  // Información de género
  binaryGender: string;
  genderIdentity?: string;
  occupation?: string;
  discipline?: string;
  
  // Información de salud
  bloodType?: string;
  rhFactor?: string;
  allergies?: string;
  healthInsurance?: string;
  
  // Contacto de emergencia
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  emergencyContactNeighborhood?: string;
  emergencyContactCity?: string;
  emergencyContactCountry?: string;
  emergencyContactPostalCode?: string;
  
  // Información de motocicleta
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleYear?: string;
  motorcyclePlate?: string;
  motorcycleEngineSize?: string;
  motorcycleColor?: string;
  soatExpirationDate?: string;
  technicalReviewExpirationDate?: string;
  
  // Información de licencia
  licenseNumber?: string;
  licenseCategory?: string;
  licenseExpirationDate?: string;
  
  // Información de BSK
  isActive: boolean;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  membershipNumber?: string;
  joinDate?: Date;
  
  // Términos y condiciones
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  acceptedDataProcessing: boolean;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  // Información personal básica
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: String, required: true },
  birthPlace: { type: String, required: true },
  
  // Información de contacto
  phone: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  neighborhood: { type: String },
  city: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String },
  
  // Información de género
  binaryGender: { type: String, required: true },
  genderIdentity: { type: String },
  occupation: { type: String },
  discipline: { type: String },
  
  // Información de salud
  bloodType: { type: String },
  rhFactor: { type: String },
  allergies: { type: String },
  healthInsurance: { type: String },
  
  // Contacto de emergencia
  emergencyContactName: { type: String, required: true },
  emergencyContactRelationship: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  emergencyContactAddress: { type: String },
  emergencyContactNeighborhood: { type: String },
  emergencyContactCity: { type: String },
  emergencyContactCountry: { type: String },
  emergencyContactPostalCode: { type: String },
  
  // Información de motocicleta
  motorcycleBrand: { type: String },
  motorcycleModel: { type: String },
  motorcycleYear: { type: String },
  motorcyclePlate: { type: String },
  motorcycleEngineSize: { type: String },
  motorcycleColor: { type: String },
  soatExpirationDate: { type: String },
  technicalReviewExpirationDate: { type: String },
  
  // Información de licencia
  licenseNumber: { type: String },
  licenseCategory: { type: String },
  licenseExpirationDate: { type: String },
  
  // Información de BSK
  isActive: { type: Boolean, default: true },
  membershipType: { 
    type: String, 
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'],
    default: 'friend'
  },
  membershipNumber: { type: String },
  joinDate: { type: Date, default: Date.now },
  
  // Términos y condiciones
  acceptedTerms: { type: Boolean, default: false },
  acceptedPrivacyPolicy: { type: Boolean, default: false },
  acceptedDataProcessing: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'users'
});

// Índices adicionales para optimizar consultas (no duplicar los unique ya definidos)
UserSchema.index({ membershipType: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ city: 1 });

// Middleware para generar número de membresía
UserSchema.pre('save', async function(next) {
  if (this.isNew && !this.membershipNumber) {
    const UserModel = this.constructor as any;
    const count = await UserModel.countDocuments();
    this.membershipNumber = `BSK${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
