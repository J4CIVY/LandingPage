import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITwoFactorCode extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  code: string;
  phoneNumber: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  verifiedAt?: Date;
  sessionInfo: {
    ip?: string;
    userAgent?: string;
    device?: string;
  };
  // Métodos de instancia
  isExpired(): boolean;
  hasExceededAttempts(): boolean;
  incrementAttempts(): Promise<void>;
  markAsVerified(): Promise<void>;
}

export interface ITwoFactorCodeModel extends Model<ITwoFactorCode> {
  cleanupExpiredCodes(): Promise<void>;
}

const TwoFactorCodeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true,
      select: false // No incluir por defecto en queries
    },
    phoneNumber: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true // Para limpiar códigos expirados
    },
    verified: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    verifiedAt: {
      type: Date
    },
    sessionInfo: {
      ip: String,
      userAgent: String,
      device: String
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para búsquedas eficientes
TwoFactorCodeSchema.index({ userId: 1, verified: 1, expiresAt: 1 });

// Método para verificar si el código ha expirado
TwoFactorCodeSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// Método para verificar si se han excedido los intentos
TwoFactorCodeSchema.methods.hasExceededAttempts = function(): boolean {
  return this.attempts >= this.maxAttempts;
};

// Método para incrementar intentos
TwoFactorCodeSchema.methods.incrementAttempts = async function(): Promise<void> {
  this.attempts += 1;
  await this.save();
};

// Método para marcar como verificado
TwoFactorCodeSchema.methods.markAsVerified = async function(): Promise<void> {
  this.verified = true;
  this.verifiedAt = new Date();
  await this.save();
};

// Método estático para limpiar códigos expirados
TwoFactorCodeSchema.statics.cleanupExpiredCodes = async function(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { createdAt: { $lt: oneDayAgo } }
    ]
  });
};

const TwoFactorCode: ITwoFactorCodeModel =
  (mongoose.models.TwoFactorCode as ITwoFactorCodeModel) || 
  mongoose.model<ITwoFactorCode, ITwoFactorCodeModel>('TwoFactorCode', TwoFactorCodeSchema);

export default TwoFactorCode;
