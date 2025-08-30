import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Información personal básica
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  email: string;
  password: string;
  
  // Información de contacto
  phone: string;
  whatsapp?: string;
  address: string;
  neighborhood?: string;
  city: string;
  country: string;
  postalCode?: string;
  
  // Información de género e identidad
  binaryGender: string;
  genderIdentity?: string;
  
  // Información profesional y salud
  occupation?: string;
  discipline?: string;
  bloodType?: string;
  rhFactor?: string;
  allergies?: string;
  healthInsurance?: string;
  
  // Contacto de emergencia
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactNeighborhood?: string;
  emergencyContactCity: string;
  emergencyContactCountry: string;
  
  // Información de motocicleta
  motorcyclePlate: string;
  motorcycleBrand: string;
  motorcycleModel: string;
  motorcycleYear: string;
  motorcycleDisplacement: string;
  
  // Campos de consentimiento
  dataConsent: boolean;
  liabilityWaiver: boolean;
  termsAcceptance: boolean;
  
  // Campos calculados/automáticos
  age: number;
  role: string;
  temporaryPassword: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  // Información personal básica
  documentType: {
    type: String,
    required: [true, 'Tipo de documento es requerido'],
    trim: true
  },
  documentNumber: {
    type: String,
    required: [true, 'Número de documento es requerido'],
    unique: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    maxlength: [50, 'Nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true,
    maxlength: [50, 'Apellido no puede exceder 50 caracteres']
  },
  birthDate: {
    type: String,
    required: [true, 'Fecha de nacimiento es requerida']
  },
  birthPlace: {
    type: String,
    required: [true, 'Lugar de nacimiento es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: [6, 'Contraseña debe tener al menos 6 caracteres']
  },
  
  // Información de contacto
  phone: {
    type: String,
    required: [true, 'Teléfono es requerido'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Dirección es requerida'],
    trim: true
  },
  neighborhood: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: [true, 'Ciudad es requerida'],
    trim: true
  },
  country: {
    type: String,
    default: 'Colombia',
    trim: true
  },
  postalCode: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Información de género e identidad
  binaryGender: {
    type: String,
    required: [true, 'Género es requerido'],
    trim: true,
    enum: ['masculino', 'femenino', 'otro']
  },
  genderIdentity: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Información profesional y salud
  occupation: {
    type: String,
    trim: true,
    default: ''
  },
  discipline: {
    type: String,
    trim: true,
    default: ''
  },
  bloodType: {
    type: String,
    trim: true,
    default: ''
  },
  rhFactor: {
    type: String,
    trim: true,
    default: ''
  },
  allergies: {
    type: String,
    trim: true,
    default: ''
  },
  healthInsurance: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Contacto de emergencia
  emergencyContactName: {
    type: String,
    required: [true, 'Contacto de emergencia es requerido'],
    trim: true
  },
  emergencyContactRelationship: {
    type: String,
    required: [true, 'Relación de contacto de emergencia es requerida'],
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    required: [true, 'Teléfono de emergencia es requerido'],
    trim: true
  },
  emergencyContactNeighborhood: {
    type: String,
    trim: true,
    default: ''
  },
  emergencyContactCity: {
    type: String,
    required: [true, 'Ciudad de contacto de emergencia es requerida'],
    trim: true
  },
  emergencyContactCountry: {
    type: String,
    required: [true, 'País de contacto de emergencia es requerido'],
    trim: true
  },
  
  // Información de motocicleta
  motorcyclePlate: {
    type: String,
    required: [true, 'Placa de motocicleta es requerida'],
    trim: true,
    uppercase: true
  },
  motorcycleBrand: {
    type: String,
    required: [true, 'Marca de motocicleta es requerida'],
    trim: true
  },
  motorcycleModel: {
    type: String,
    required: [true, 'Modelo de motocicleta es requerido'],
    trim: true
  },
  motorcycleYear: {
    type: String,
    required: [true, 'Año de motocicleta es requerido'],
    trim: true
  },
  motorcycleDisplacement: {
    type: String,
    required: [true, 'Cilindraje de motocicleta es requerido'],
    trim: true
  },
  
  // Campos de consentimiento
  dataConsent: {
    type: Boolean,
    required: [true, 'Consentimiento de datos es requerido']
  },
  liabilityWaiver: {
    type: Boolean,
    required: [true, 'Exención de responsabilidad es requerida']
  },
  termsAcceptance: {
    type: Boolean,
    required: [true, 'Aceptación de términos es requerida']
  },
  
  // Campos calculados/automáticos
  age: {
    type: Number,
    required: [true, 'Edad es requerida'],
    min: [18, 'Debe ser mayor de edad']
  },
  role: {
    type: String,
    default: 'Membresia Friend',
    enum: ['Membresia Friend', 'Membresia Active', 'Membresia VIP', 'Admin']
  },
  temporaryPassword: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password; // No incluir password en respuestas JSON
      return ret;
    }
  }
});

// Índices para mejorar performance
UserSchema.index({ email: 1, documentNumber: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1 });
UserSchema.index({ motorcyclePlate: 1 });

// Middleware para hashear contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.default.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(candidatePassword, this.password);
};

// Prevenir re-compilación en desarrollo
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
