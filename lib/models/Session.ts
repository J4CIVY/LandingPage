import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionToken: string;
  refreshToken: string;
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    device?: string;
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  expiresAt: Date;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    userAgent: { type: String },
    ip: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Índices adicionales
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 });
SessionSchema.index({ lastUsed: -1 });

// Middleware para actualizar lastUsed
SessionSchema.methods.updateLastUsed = function(this: ISession): Promise<ISession> {
  this.lastUsed = new Date();
  return this.save();
};

// Método para invalidar sesión
SessionSchema.methods.invalidate = function(this: ISession): Promise<ISession> {
  this.isActive = false;
  return this.save();
};

// Método estático para limpiar sesiones expiradas
SessionSchema.statics.cleanExpiredSessions = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
