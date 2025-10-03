import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'event_registration' | 'event_cancellation' | 'event_attendance' | 'store_purchase' | 'pqrsdf_sent' | 'profile_update' | 'membership_update' | 'password_change' | 'payment_completed' | 'payment_failed' | 'document_upload' | 'achievement_earned' | 'points_earned';
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  metadata?: {
    eventId?: string;
    eventName?: string;
    orderId?: string;
    amount?: number;
    pqrsdfId?: string;
    achievementId?: string;
    points?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'event_registration',
        'event_cancellation',
        'event_attendance',
        'store_purchase',
        'pqrsdf_sent',
        'profile_update',
        'membership_update',
        'password_change',
        'payment_completed',
        'payment_failed',
        'document_upload',
        'achievement_earned',
        'points_earned'
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'failed'],
      default: 'completed',
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Índices para búsquedas eficientes
UserActivitySchema.index({ userId: 1, createdAt: -1 });
UserActivitySchema.index({ type: 1, createdAt: -1 });

const UserActivity = mongoose.models.UserActivity || 
  mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);

export default UserActivity;
