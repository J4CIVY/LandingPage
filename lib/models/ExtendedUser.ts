import { Schema, model, models, Document } from 'mongoose';

// Interfaces para los nuevos datos del perfil
export interface IEmergencyContact {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  isHealthcareProxy?: boolean;
}

export interface IMedicalData {
  bloodType?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyMedicalInfo?: string;
  healthInsurance?: {
    provider: string;
    policyNumber: string;
    coverage: string;
  };
  doctorContact?: {
    name: string;
    specialty: string;
    phone: string;
    clinic: string;
  };
  privacyAccepted: boolean;
  lastUpdated: Date;
}

export interface IMotorcycleInfo {
  motorcycles: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    displacement: string;
    color: string;
    plateNumber: string;
    chassisNumber?: string;
    engineNumber?: string;
    isPrimary: boolean;
    photos: string[]; // URLs de Cloudinary
  }>;
  licenses: Array<{
    type: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3';
    number: string;
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
    documentUrl?: string;
  }>;
  mechanicalSkills: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    specialties: string[];
    certifications: string[];
  };
  ridingExperience: {
    yearsRiding: number;
    kmPerYear: number;
    preferredRoutes: string[];
    groupRideExperience: boolean;
  };
}

export interface IUserDocument {
  id: string;
  name: string;
  type: 'identity' | 'license' | 'medical' | 'insurance' | 'motorcycle' | 'other';
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  expiryDate?: Date;
  isRequired: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  adminNotes?: string;
  approvedBy?: string;
  approvedDate?: Date;
  tags: string[];
}

export interface IUserActivity {
  id: string;
  type: 'login' | 'logout' | 'profile_update' | 'document_upload' | 'password_change' | 'email_change' | 'membership_action' | 'admin_action';
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface IUserSession {
  id: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
  location?: {
    country?: string;
    city?: string;
    ip?: string;
  };
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  token?: string;
}

export interface INotificationPreferences {
  email: {
    events: boolean;
    reminders: boolean;
    newsletter: boolean;
    adminNotifications: boolean;
    documentExpiry: boolean;
    emergencyAlerts: boolean;
  };
  whatsapp: {
    events: boolean;
    reminders: boolean;
    emergencyAlerts: boolean;
  };
  push: {
    events: boolean;
    reminders: boolean;
    emergencyAlerts: boolean;
  };
}

// Esquemas de Mongoose
const EmergencyContactSchema = new Schema<IEmergencyContact>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  alternativePhone: { type: String },
  email: { type: String },
  address: { type: String },
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  isHealthcareProxy: { type: Boolean, default: false }
});

const MedicalDataSchema = new Schema<IMedicalData>({
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{ type: String }],
  medications: [{ type: String }],
  medicalConditions: [{ type: String }],
  emergencyMedicalInfo: { type: String },
  healthInsurance: {
    provider: { type: String },
    policyNumber: { type: String },
    coverage: { type: String }
  },
  doctorContact: {
    name: { type: String },
    specialty: { type: String },
    phone: { type: String },
    clinic: { type: String }
  },
  privacyAccepted: { type: Boolean, required: true, default: false },
  lastUpdated: { type: Date, default: Date.now }
});

const MotorcycleInfoSchema = new Schema<IMotorcycleInfo>({
  motorcycles: [{
    id: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    displacement: { type: String, required: true },
    color: { type: String, required: true },
    plateNumber: { type: String, required: true },
    chassisNumber: { type: String },
    engineNumber: { type: String },
    isPrimary: { type: Boolean, default: false },
    photos: [{ type: String }]
  }],
  licenses: [{
    type: { 
      type: String, 
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3'],
      required: true 
    },
    number: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    issuingAuthority: { type: String, required: true },
    documentUrl: { type: String }
  }],
  mechanicalSkills: {
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    specialties: [{ type: String }],
    certifications: [{ type: String }]
  },
  ridingExperience: {
    yearsRiding: { type: Number, default: 0 },
    kmPerYear: { type: Number, default: 0 },
    preferredRoutes: [{ type: String }],
    groupRideExperience: { type: Boolean, default: false }
  }
});

const UserDocumentSchema = new Schema<IUserDocument>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['identity', 'license', 'medical', 'insurance', 'motorcycle', 'other'],
    required: true 
  },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  isRequired: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending' 
  },
  adminNotes: { type: String },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  tags: [{ type: String }]
});

const UserActivitySchema = new Schema<IUserActivity>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['login', 'logout', 'profile_update', 'document_upload', 'password_change', 'email_change', 'membership_action', 'admin_action'],
    required: true 
  },
  description: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: [{ type: Number }]
  },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, required: true },
  errorMessage: { type: String }
});

const UserSessionSchema = new Schema<IUserSession>({
  id: { type: String, required: true },
  deviceInfo: {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    device: { type: String, required: true },
    isMobile: { type: Boolean, default: false }
  },
  location: {
    country: { type: String },
    city: { type: String },
    ip: { type: String }
  },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  token: { type: String }
});

const NotificationPreferencesSchema = new Schema<INotificationPreferences>({
  email: {
    events: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    adminNotifications: { type: Boolean, default: true },
    documentExpiry: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true }
  },
  whatsapp: {
    events: { type: Boolean, default: false },
    reminders: { type: Boolean, default: false },
    emergencyAlerts: { type: Boolean, default: true }
  },
  push: {
    events: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true }
  }
});

// Extensión del esquema de Usuario existente
export interface IExtendedUser extends Document {
  // Campos existentes del User original
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'super-admin';
  isActive: boolean;
  membershipNumber?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Nuevos campos extendidos
  documentNumber?: string;
  documentType?: 'CC' | 'CE' | 'TI' | 'PP' | 'RC';
  profession?: string;
  workAddress?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'union';
  education?: string;
  
  // Datos relacionados
  emergencyContact?: IEmergencyContact;
  medicalData?: IMedicalData;
  motorcycleInfo?: IMotorcycleInfo;
  documents: IUserDocument[];
  activities: IUserActivity[];
  activeSessions: IUserSession[];
  notificationPreferences: INotificationPreferences;
  
  // Configuración de privacidad
  privacy: {
    showProfile: boolean;
    showContact: boolean;
    showMedical: boolean;
    showMotorcycle: boolean;
    allowContact: boolean;
  };
  
  // Configuración de privacidad para la comunidad
  privacySettings?: {
    showName: boolean;
    showPhoto: boolean;
    showPoints: boolean;
    showActivity: boolean;
  };
  
  // Metadata de administración
  adminNotes?: string;
  accountStatus: 'active' | 'suspended' | 'inactive' | 'pending_approval' | 'scheduled_deletion' | 'pending_deletion';
  membershipType: 'member' | 'associate' | 'honorary';
  joinDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  
  // Campos para eliminación de cuenta
  scheduledDeletionDate?: Date;
  deletionRequestDate?: Date;
  deletionReason?: string;
  
  // Configuración de perfil
  profileCompletion: number;
  lastProfileUpdate: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Preferencias de idioma y zona horaria
  language?: string;
  timezone?: string;
  twoFactorEnabled: boolean;
  
  // Preferencias de seguridad
  securityAlerts?: boolean;
}

// Esquema extendido del Usuario
const ExtendedUserSchema = new Schema<IExtendedUser>({
  // Campos básicos existentes
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super-admin'], 
    default: 'user' 
  },
  isActive: { type: Boolean, default: true },
  membershipNumber: { type: String, unique: true, sparse: true },
  dateOfBirth: { type: Date },
  phone: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Colombia' }
  },
  profilePicture: { type: String },
  
  // Nuevos campos de información personal
  documentNumber: { type: String },
  documentType: { 
    type: String, 
    enum: ['CC', 'CE', 'TI', 'PP', 'RC']
  },
  profession: { type: String },
  workAddress: { type: String },
  maritalStatus: { 
    type: String, 
    enum: ['single', 'married', 'divorced', 'widowed', 'union']
  },
  education: { type: String },
  
  // Datos relacionados
  emergencyContact: { type: EmergencyContactSchema },
  medicalData: { type: MedicalDataSchema },
  motorcycleInfo: { type: MotorcycleInfoSchema },
  documents: [UserDocumentSchema],
  activities: [UserActivitySchema],
  activeSessions: [UserSessionSchema],
  notificationPreferences: { 
    type: NotificationPreferencesSchema, 
    default: () => ({}) 
  },
  
  // Configuración de privacidad
  privacy: {
    showProfile: { type: Boolean, default: true },
    showContact: { type: Boolean, default: false },
    showMedical: { type: Boolean, default: false },
    showMotorcycle: { type: Boolean, default: true },
    allowContact: { type: Boolean, default: true }
  },
  
  // Configuración de privacidad para la comunidad
  privacySettings: {
    showName: { type: Boolean, default: true },
    showPhoto: { type: Boolean, default: true },
    showPoints: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true }
  },
  
  // Metadata de administración
  adminNotes: { type: String },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'inactive', 'pending_approval', 'scheduled_deletion', 'pending_deletion'],
    default: 'active'
  },
  membershipType: { 
    type: String, 
    enum: ['member', 'associate', 'honorary'],
    default: 'member'
  },
  joinDate: { type: Date },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  
  // Campos para eliminación de cuenta
  scheduledDeletionDate: { type: Date },
  deletionRequestDate: { type: Date },
  deletionReason: { type: String },
  
  // Configuración de perfil
  profileCompletion: { type: Number, default: 0 },
  lastProfileUpdate: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  
  // Preferencias de idioma y zona horaria
  language: { type: String, default: 'es' },
  timezone: { type: String, default: 'America/Bogota' },
  
  // Preferencias de seguridad
  securityAlerts: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
// email y membershipNumber ya tienen índices unique en la definición del schema
ExtendedUserSchema.index({ role: 1 });
ExtendedUserSchema.index({ accountStatus: 1 });
ExtendedUserSchema.index({ 'documents.status': 1 });
ExtendedUserSchema.index({ 'activities.timestamp': -1 });
ExtendedUserSchema.index({ profileCompletion: 1 });

// Virtuals
ExtendedUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

ExtendedUserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
});

ExtendedUserSchema.virtual('pendingDocuments').get(function() {
  return this.documents.filter(doc => doc.status === 'pending').length;
});

ExtendedUserSchema.virtual('expiredDocuments').get(function() {
  const now = new Date();
  return this.documents.filter(doc => 
    doc.expiryDate && doc.expiryDate < now
  ).length;
});

// Middleware para calcular el porcentaje de completitud del perfil
ExtendedUserSchema.pre('save', function(next) {
  let completionFields = 0;
  let filledFields = 0;
  
  // Campos básicos (peso: 40%)
  const basicFields: (keyof IExtendedUser)[] = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
  completionFields += basicFields.length;
  filledFields += basicFields.filter(field => this[field]).length;
  
  // Dirección (peso: 10%)
  if (this.address && this.address.street && this.address.city) {
    filledFields += 1;
  }
  completionFields += 1;
  
  // Información adicional (peso: 15%)
  const additionalFields: (keyof IExtendedUser)[] = ['documentNumber', 'profession', 'maritalStatus'];
  completionFields += additionalFields.length;
  filledFields += additionalFields.filter(field => this[field]).length;
  
  // Contacto de emergencia (peso: 15%)
  if (this.emergencyContact && this.emergencyContact.firstName && this.emergencyContact.phone) {
    filledFields += 1;
  }
  completionFields += 1;
  
  // Información de motocicleta (peso: 10%)
  if (this.motorcycleInfo && this.motorcycleInfo.motorcycles.length > 0) {
    filledFields += 1;
  }
  completionFields += 1;
  
  // Documentos requeridos (peso: 10%)
  const requiredDocs = this.documents.filter(doc => doc.isRequired);
  const approvedRequiredDocs = requiredDocs.filter(doc => doc.status === 'approved');
  if (requiredDocs.length > 0 && approvedRequiredDocs.length === requiredDocs.length) {
    filledFields += 1;
  }
  completionFields += 1;
  
  this.profileCompletion = Math.round((filledFields / completionFields) * 100);
  this.lastProfileUpdate = new Date();
  
  next();
});

// Exportar el modelo
export const ExtendedUser = models.ExtendedUser || model<IExtendedUser>('ExtendedUser', ExtendedUserSchema);

export default ExtendedUser;