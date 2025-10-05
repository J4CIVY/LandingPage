import mongoose, { Schema, Document } from 'mongoose';

export interface IPreAuthToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  sessionInfo: {
    ip: string;
    userAgent: string;
    device: string;
  };
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PreAuthTokenSchema = new Schema<IPreAuthToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionInfo: {
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    device: { type: String, default: 'unknown' }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true // Para limpieza automática
  },
  used: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Index para eliminar tokens expirados automáticamente (TTL index)
PreAuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método estático para limpiar tokens expirados manualmente (backup)
PreAuthTokenSchema.statics.cleanupExpiredTokens = async function() {
  const now = new Date();
  return this.deleteMany({ expiresAt: { $lt: now } });
};

// Método para verificar si el token es válido
PreAuthTokenSchema.methods.isValid = function(): boolean {
  return !this.used && this.expiresAt > new Date();
};

// Método para marcar el token como usado
PreAuthTokenSchema.methods.markAsUsed = async function() {
  this.used = true;
  return this.save();
};

const PreAuthToken = mongoose.models.PreAuthToken || 
  mongoose.model<IPreAuthToken>('PreAuthToken', PreAuthTokenSchema);

export default PreAuthToken;
