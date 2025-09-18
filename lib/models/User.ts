import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  password: string;
  role: 'user' | 'admin' | 'super-admin';
  
  // Imagen de perfil
  profileImage?: string;
  
  // Autenticación y seguridad
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  lastActivity?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  
  // Términos y condiciones
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  acceptedDataProcessing: boolean;
  
  // Eventos y actividades
  events?: mongoose.Types.ObjectId[]; // Eventos en los que está registrado
  favoriteEvents?: mongoose.Types.ObjectId[]; // Eventos marcados como favoritos
  attendedEvents?: mongoose.Types.ObjectId[]; // Eventos en los que se confirmó su asistencia
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): any; // Cambiar a any para permitir campos adicionales como fullName
  updateLastLogin(): Promise<IUser>;
  incrementLoginAttempts(): Promise<IUser>;
  resetLoginAttempts(): Promise<IUser>;
  isAccountLocked(): boolean;
}

const UserSchema = new Schema<IUser>({
  // Información personal básica
  documentType: { type: String, required: true, trim: true },
  documentNumber: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  birthDate: { type: String, required: true },
  birthPlace: { type: String, required: true, trim: true },
  
  // Información de contacto
  phone: { type: String, required: true, trim: true },
  whatsapp: { type: String, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  address: { type: String, required: true, trim: true },
  neighborhood: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  postalCode: { type: String, trim: true },
  
  // Información de género
  binaryGender: { 
    type: String, 
    required: true,
    enum: ['Masculino', 'Femenino', 'Otro']
  },
  genderIdentity: { type: String, trim: true },
  occupation: { type: String, trim: true },
  discipline: { type: String, trim: true },
  
  // Información de salud
  bloodType: { type: String, trim: true },
  rhFactor: { type: String, trim: true },
  allergies: { type: String, trim: true },
  healthInsurance: { type: String, trim: true },
  
  // Contacto de emergencia
  emergencyContactName: { type: String, required: true, trim: true },
  emergencyContactRelationship: { type: String, required: true, trim: true },
  emergencyContactPhone: { type: String, required: true, trim: true },
  emergencyContactAddress: { type: String, trim: true },
  emergencyContactNeighborhood: { type: String, trim: true },
  emergencyContactCity: { type: String, trim: true },
  emergencyContactCountry: { type: String, trim: true },
  emergencyContactPostalCode: { type: String, trim: true },
  
  // Información de motocicleta
  motorcycleBrand: { type: String, trim: true },
  motorcycleModel: { type: String, trim: true },
  motorcycleYear: { type: String, trim: true },
  motorcyclePlate: { type: String, trim: true, uppercase: true },
  motorcycleEngineSize: { type: String, trim: true },
  motorcycleColor: { type: String, trim: true },
  soatExpirationDate: { type: String },
  technicalReviewExpirationDate: { type: String },
  
  // Información de licencia
  licenseNumber: { type: String, trim: true },
  licenseCategory: { type: String, trim: true },
  licenseExpirationDate: { type: String },
  
  // Información de BSK
  isActive: { type: Boolean, default: true },
  membershipType: { 
    type: String, 
    enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'],
    default: 'friend'
  },
  membershipNumber: { type: String, unique: true, sparse: true },
  joinDate: { type: Date, default: Date.now },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // Por defecto no incluir en queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user'
  },
  
  // Imagen de perfil
  profileImage: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v: string) {
        // Validar que sea una URL de Cloudinary válida si está presente
        if (!v) return true;
        return v.includes('cloudinary.com') || v.includes('res.cloudinary.com');
      },
      message: 'La imagen de perfil debe ser una URL válida de Cloudinary'
    }
  },
  
  // Autenticación y seguridad
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  lastLogin: { type: Date },
  lastActivity: { type: Date, default: Date.now },
  loginAttempts: { type: Number, default: 0, max: 5 },
  lockUntil: { type: Date },
  
  // Términos y condiciones
  acceptedTerms: { type: Boolean, default: false, required: true },
  acceptedPrivacyPolicy: { type: Boolean, default: false, required: true },
  acceptedDataProcessing: { type: Boolean, default: false, required: true },
  
  // Eventos y actividades
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  favoriteEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  attendedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }] // Eventos confirmados como asistidos
}, {
  timestamps: true,
  collection: 'users',
  toJSON: { 
    virtuals: true, 
    transform: function(doc: any, ret: any) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

// Índices adicionales para optimizar consultas
UserSchema.index({ membershipType: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ city: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ lastActivity: -1 });
UserSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });

// Virtual para nombre completo
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual para verificar si la cuenta está bloqueada
UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password con salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Middleware para generar número de membresía
UserSchema.pre('save', async function(next) {
  if (this.isNew && !this.membershipNumber) {
    const UserModel = this.constructor as any;
    const count = await UserModel.countDocuments();
    this.membershipNumber = `BSK${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  try {
    console.log('🔍 comparePassword called with:', {
      candidatePasswordLength: candidatePassword?.length,
      hasStoredPassword: !!this.password,
      storedPasswordPrefix: this.password?.substring(0, 10)
    });
    
    if (!candidatePassword) {
      throw new Error('candidatePassword is required');
    }
    
    if (!this.password) {
      throw new Error('stored password is empty');
    }
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔍 comparePassword result:', result);
    return result;
  } catch (error) {
    console.error('🔍 comparePassword error:', error);
    throw new Error('Error al comparar contraseñas');
  }
};

// Método para obtener perfil público (sin datos sensibles)
UserSchema.methods.getPublicProfile = function(this: IUser): any {
  return {
    _id: this._id,
    id: this._id, // Alias para id
    
    // Información personal básica
    documentType: this.documentType,
    documentNumber: this.documentNumber,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`, // Campo computed
    birthDate: this.birthDate,
    birthPlace: this.birthPlace,
    
    // Información de contacto
    phone: this.phone,
    whatsapp: this.whatsapp,
    email: this.email,
    address: this.address,
    neighborhood: this.neighborhood,
    city: this.city,
    country: this.country,
    postalCode: this.postalCode,
    
    // Información de género y ocupación
    binaryGender: this.binaryGender,
    genderIdentity: this.genderIdentity,
    occupation: this.occupation,
    discipline: this.discipline,
    
    // Información de salud
    bloodType: this.bloodType,
    rhFactor: this.rhFactor,
    allergies: this.allergies,
    healthInsurance: this.healthInsurance,
    
    // Contacto de emergencia
    emergencyContactName: this.emergencyContactName,
    emergencyContactRelationship: this.emergencyContactRelationship,
    emergencyContactPhone: this.emergencyContactPhone,
    emergencyContactAddress: this.emergencyContactAddress,
    emergencyContactNeighborhood: this.emergencyContactNeighborhood,
    emergencyContactCity: this.emergencyContactCity,
    emergencyContactCountry: this.emergencyContactCountry,
    emergencyContactPostalCode: this.emergencyContactPostalCode,
    
    // Información de motocicleta
    motorcycleBrand: this.motorcycleBrand,
    motorcycleModel: this.motorcycleModel,
    motorcycleYear: this.motorcycleYear,
    motorcyclePlate: this.motorcyclePlate,
    motorcycleEngineSize: this.motorcycleEngineSize,
    motorcycleColor: this.motorcycleColor,
    soatExpirationDate: this.soatExpirationDate,
    technicalReviewExpirationDate: this.technicalReviewExpirationDate,
    
    // Información de licencia
    licenseNumber: this.licenseNumber,
    licenseCategory: this.licenseCategory,
    licenseExpirationDate: this.licenseExpirationDate,
    
    // Información de BSK
    isActive: this.isActive,
    membershipType: this.membershipType,
    membershipNumber: this.membershipNumber,
    joinDate: this.joinDate,
    role: this.role,
    
    // Imagen de perfil
    profileImage: this.profileImage,
    
    // Estado de verificación
    isEmailVerified: this.isEmailVerified,
    isLocked: this.isAccountLocked(), // Método para verificar si está bloqueado
    
    // Términos y condiciones
    acceptedTerms: this.acceptedTerms,
    acceptedPrivacyPolicy: this.acceptedPrivacyPolicy,
    acceptedDataProcessing: this.acceptedDataProcessing,
    
    // Eventos y actividades
    events: this.events,
    favoriteEvents: this.favoriteEvents,
    attendedEvents: this.attendedEvents,
    
    // Metadatos
    lastLogin: this.lastLogin,
    loginAttempts: this.loginAttempts,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Método para actualizar última conexión
UserSchema.methods.updateLastLogin = function(this: IUser): Promise<IUser> {
  this.lastLogin = new Date();
  return this.save();
};

// Método para incrementar intentos de login
UserSchema.methods.incrementLoginAttempts = function(this: IUser): Promise<IUser> {
  // Si tenemos un lock previo y ya expiró, reiniciar
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Si llegamos al máximo de intentos y no estamos bloqueados, bloquear cuenta
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 horas
  }
  
  return this.updateOne(updates);
};

// Método para resetear intentos de login
UserSchema.methods.resetLoginAttempts = function(this: IUser): Promise<IUser> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Método para verificar si la cuenta está bloqueada
UserSchema.methods.isAccountLocked = function(this: IUser): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
