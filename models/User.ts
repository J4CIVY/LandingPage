import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  whatsapp?: string;
  email: string;
  password: string;
  genderIdentity: string;
  occupation: string;
  eps: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleYear?: number;
  motorcyclePlate?: string;
  country: string;
  age: number;
  role: string;
  temporaryPassword: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
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
  genderIdentity: {
    type: String,
    required: [true, 'Identidad de género es requerida'],
    trim: true
  },
  occupation: {
    type: String,
    required: [true, 'Ocupación es requerida'],
    trim: true
  },
  eps: {
    type: String,
    required: [true, 'EPS es requerida'],
    trim: true
  },
  emergencyContactName: {
    type: String,
    required: [true, 'Contacto de emergencia es requerido'],
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    required: [true, 'Teléfono de emergencia es requerido'],
    trim: true
  },
  motorcycleBrand: {
    type: String,
    trim: true,
    default: ''
  },
  motorcycleModel: {
    type: String,
    trim: true,
    default: ''
  },
  motorcycleYear: {
    type: Number,
    min: [1900, 'Año inválido'],
    max: [new Date().getFullYear() + 1, 'Año inválido']
  },
  motorcyclePlate: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  country: {
    type: String,
    default: 'Colombia',
    trim: true
  },
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
