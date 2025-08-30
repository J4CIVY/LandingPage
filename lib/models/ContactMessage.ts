import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  
  // Categorización del mensaje
  category: 'general' | 'membership' | 'events' | 'complaints' | 'suggestions' | 'technical' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Estado de seguimiento
  status: 'new' | 'read' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  
  // Respuesta y seguimiento
  response?: string;
  responseDate?: Date;
  respondedBy?: mongoose.Types.ObjectId;
  respondedByName?: string;
  
  // Comunicación adicional
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  
  // Conversación completa
  conversation?: Array<{
    date: Date;
    from: 'user' | 'staff';
    message: string;
    author?: string;
    isPublic: boolean;
  }>;
  
  // Archivos adjuntos
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadDate: Date;
  }>;
  
  // Metadatos del contacto
  source: 'website' | 'email' | 'phone' | 'whatsapp' | 'social-media' | 'in-person';
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  
  // Datos adicionales para análisis
  customerSatisfaction?: 1 | 2 | 3 | 4 | 5;
  resolutionTime?: number; // en horas
  tags?: string[];
  
  // Información de ubicación si es relevante
  city?: string;
  country?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 2000 },
  
  // Categorización del mensaje
  category: {
    type: String,
    enum: ['general', 'membership', 'events', 'complaints', 'suggestions', 'technical', 'emergency'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Estado de seguimiento
  status: {
    type: String,
    enum: ['new', 'read', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String },
  
  // Respuesta y seguimiento
  response: { type: String, maxlength: 2000 },
  responseDate: { type: Date },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  respondedByName: { type: String },
  
  // Comunicación adicional
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpNotes: { type: String, maxlength: 500 },
  
  // Conversación completa
  conversation: [{
    date: { type: Date, default: Date.now },
    from: {
      type: String,
      enum: ['user', 'staff'],
      required: true
    },
    message: { type: String, required: true, maxlength: 1000 },
    author: { type: String },
    isPublic: { type: Boolean, default: true }
  }],
  
  // Archivos adjuntos
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Metadatos del contacto
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'whatsapp', 'social-media', 'in-person'],
    default: 'website'
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  referrerUrl: { type: String },
  
  // Datos adicionales para análisis
  customerSatisfaction: {
    type: Number,
    min: 1,
    max: 5
  },
  resolutionTime: { type: Number }, // en horas
  tags: [{ type: String, trim: true }],
  
  // Información de ubicación si es relevante
  city: { type: String, trim: true },
  country: { type: String, trim: true },
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'contact_messages'
});

// Índices para optimizar consultas
ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ category: 1 });
ContactMessageSchema.index({ priority: 1 });
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ assignedTo: 1 });
ContactMessageSchema.index({ responseDate: 1 });
ContactMessageSchema.index({ followUpDate: 1 });

// Índice compuesto para consultas frecuentes
ContactMessageSchema.index({ status: 1, priority: -1, createdAt: -1 });
ContactMessageSchema.index({ category: 1, status: 1 });

// Middleware para auto-asignación de prioridad según categoría
ContactMessageSchema.pre('save', function(next) {
  // Asignar prioridad automáticamente si no se especifica
  if (this.isNew && !this.isModified('priority')) {
    if (this.category === 'emergency') {
      this.priority = 'urgent';
    } else if (this.category === 'complaints') {
      this.priority = 'high';
    } else if (this.category === 'technical') {
      this.priority = 'medium';
    }
  }
  
  // Calcular tiempo de resolución cuando se cierra
  if (this.isModified('status') && (this.status === 'resolved' || this.status === 'closed')) {
    if (!this.resolutionTime) {
      const now = new Date();
      this.resolutionTime = Math.round((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)); // en horas
    }
  }
  
  // Establecer fecha de respuesta cuando se responde por primera vez
  if (this.isModified('response') && this.response && !this.responseDate) {
    this.responseDate = new Date();
  }
  
  next();
});

// Middleware para agregar mensaje inicial a la conversación
ContactMessageSchema.post('save', async function(doc) {
  if (doc.isNew && (!doc.conversation || doc.conversation.length === 0)) {
    doc.conversation = [{
      date: doc.createdAt,
      from: 'user',
      message: doc.message,
      author: doc.name,
      isPublic: true
    }];
    await doc.save();
  }
});

// Método virtual para verificar si requiere atención urgente
ContactMessageSchema.virtual('requiresUrgentAttention').get(function() {
  if (this.priority === 'urgent') return true;
  if (this.category === 'emergency') return true;
  
  // Si lleva más de 24 horas sin respuesta y es alta prioridad
  if (this.priority === 'high' && this.status === 'new') {
    const hoursSinceCreated = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated > 24;
  }
  
  return false;
});

// Método virtual para tiempo de respuesta
ContactMessageSchema.virtual('responseTimeHours').get(function() {
  if (this.responseDate) {
    return Math.round((this.responseDate.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
  }
  return null;
});

// Método virtual para verificar si está vencido para seguimiento
ContactMessageSchema.virtual('isOverdueForFollowUp').get(function() {
  if (!this.followUpRequired || !this.followUpDate) return false;
  return new Date() > this.followUpDate;
});

// Método para agregar mensaje a la conversación
ContactMessageSchema.methods.addMessage = function(
  from: 'user' | 'staff',
  message: string,
  author?: string,
  isPublic: boolean = true
) {
  if (!this.conversation) {
    this.conversation = [];
  }
  
  this.conversation.push({
    date: new Date(),
    from,
    message,
    author,
    isPublic
  });
  
  return this.save();
};

// Método para asignar a un miembro del staff
ContactMessageSchema.methods.assignTo = function(userId: mongoose.Types.ObjectId, userName: string) {
  this.assignedTo = userId;
  this.assignedToName = userName;
  if (this.status === 'new') {
    this.status = 'read';
  }
  return this.save();
};

// Método para marcar como resuelto
ContactMessageSchema.methods.markAsResolved = function(response?: string, resolvedBy?: { id: mongoose.Types.ObjectId, name: string }) {
  this.status = 'resolved';
  if (response) {
    this.response = response;
    this.responseDate = new Date();
  }
  if (resolvedBy) {
    this.respondedBy = resolvedBy.id;
    this.respondedByName = resolvedBy.name;
  }
  return this.save();
};

export default mongoose.models.ContactMessage || 
                mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
