import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'event_upcoming' | 'event_registration_open' | 'event_reminder' | 'membership_update' | 'system_announcement';
  title: string;
  message: string;
  data?: {
    eventId?: mongoose.Types.ObjectId;
    eventName?: string;
    eventDate?: Date;
    registrationDeadline?: Date;
    url?: string;
    [key: string]: any;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['event_upcoming', 'event_registration_open', 'event_reminder', 'membership_update', 'system_announcement'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices compuestos para optimización
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Método para marcar como leída
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Método estático para obtener notificaciones no leídas
NotificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

// Método estático para crear notificación de evento próximo
NotificationSchema.statics.createEventUpcomingNotification = function(userId: string, event: any) {
  const daysUntilEvent = Math.ceil((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return this.create({
    userId,
    type: 'event_upcoming',
    title: `Evento próximo: ${event.name}`,
    message: `El evento "${event.name}" será en ${daysUntilEvent} días. ¡No te lo pierdas!`,
    data: {
      eventId: event._id,
      eventName: event.name,
      eventDate: event.startDate,
      url: `/events/${event._id}`
    },
    priority: daysUntilEvent <= 3 ? 'high' : 'medium',
    expiresAt: new Date(event.startDate.getTime() + 24 * 60 * 60 * 1000) // Expira 1 día después del evento
  });
};

// Método estático para crear notificación de registro abierto
NotificationSchema.statics.createRegistrationOpenNotification = function(userId: string, event: any) {
  return this.create({
    userId,
    type: 'event_registration_open',
    title: `Registro abierto: ${event.name}`,
    message: `Ya está abierto el registro para "${event.name}". ¡Inscríbete ahora!`,
    data: {
      eventId: event._id,
      eventName: event.name,
      eventDate: event.startDate,
      registrationDeadline: event.registrationDeadline,
      url: `/events/${event._id}`
    },
    priority: 'high',
    expiresAt: event.registrationDeadline || new Date(event.startDate.getTime() - 24 * 60 * 60 * 1000)
  });
};

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
