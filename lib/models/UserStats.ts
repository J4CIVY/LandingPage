import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Puntos y niveles
  totalPoints: number;
  monthlyPoints: number;
  annualPoints: number;
  level: number;
  
  // Estadísticas de eventos
  eventsAttended: number;
  eventsRegistered: number;
  eventsCreated: number;
  eventsCancelled: number;
  
  // Estadísticas mensuales y anuales
  monthlyEventsAttended: number;
  annualEventsAttended: number;
  
  // Ranking
  currentRank: number;
  bestRank: number;
  rankingUpdatedAt: Date;
  
  // Logros
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    pointsAwarded: number;
    achievedAt: Date;
    type: 'event' | 'participation' | 'social' | 'special';
  }>;
  
  // Participación
  participationScore: number; // Calculado basado en asistencia vs registro
  consistencyScore: number; // Basado en participación mensual
  
  // Fechas de control
  lastActivityDate: Date;
  monthlyResetDate: Date;
  annualResetDate: Date;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Puntos y niveles
  totalPoints: { type: Number, default: 0, min: 0 },
  monthlyPoints: { type: Number, default: 0, min: 0 },
  annualPoints: { type: Number, default: 0, min: 0 },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Estadísticas de eventos
  eventsAttended: { type: Number, default: 0, min: 0 },
  eventsRegistered: { type: Number, default: 0, min: 0 },
  eventsCreated: { type: Number, default: 0, min: 0 },
  eventsCancelled: { type: Number, default: 0, min: 0 },
  
  // Estadísticas mensuales y anuales
  monthlyEventsAttended: { type: Number, default: 0, min: 0 },
  annualEventsAttended: { type: Number, default: 0, min: 0 },
  
  // Ranking
  currentRank: { type: Number, default: 0, min: 0 },
  bestRank: { type: Number, default: 0, min: 0 },
  rankingUpdatedAt: { type: Date, default: Date.now },
  
  // Logros
  achievements: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    pointsAwarded: { type: Number, required: true, min: 0 },
    achievedAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['event', 'participation', 'social', 'special'],
      required: true
    }
  }],
  
  // Participación
  participationScore: { type: Number, default: 0, min: 0, max: 100 },
  consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Fechas de control
  lastActivityDate: { type: Date, default: Date.now },
  monthlyResetDate: { type: Date, default: () => getNextMonthReset() },
  annualResetDate: { type: Date, default: () => getNextYearReset() }
}, {
  timestamps: true,
  collection: 'user_stats'
});

// Índices para optimizar consultas
UserStatsSchema.index({ userId: 1 });
UserStatsSchema.index({ currentRank: 1 });
UserStatsSchema.index({ totalPoints: -1 });
UserStatsSchema.index({ level: 1 });
UserStatsSchema.index({ rankingUpdatedAt: 1 });

// Métodos del esquema
UserStatsSchema.methods.calculateLevel = function(): string {
  const points = this.annualPoints;
  
  if (points >= 5000) return 'diamante';
  if (points >= 3000) return 'platino';
  if (points >= 1500) return 'oro';
  if (points >= 500) return 'plata';
  return 'bronce';
};

UserStatsSchema.methods.getPointsForNextLevel = function(): number {
  const currentLevel = this.level;
  const points = this.annualPoints;
  
  switch (currentLevel) {
    case 'bronce': return 500 - points;
    case 'plata': return 1500 - points;
    case 'oro': return 3000 - points;
    case 'platino': return 5000 - points;
    case 'diamante': return 0; // Ya está en el nivel máximo
    default: return 500 - points;
  }
};

UserStatsSchema.methods.calculateParticipationScore = function(): number {
  if (this.eventsRegistered === 0) return 0;
  return Math.round((this.eventsAttended / this.eventsRegistered) * 100);
};

UserStatsSchema.methods.addAchievement = function(achievement: {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
  type: 'event' | 'participation' | 'social' | 'special';
}): void {
  // Verificar si ya tiene este logro
  const existingAchievement = this.achievements.find((a: any) => a.id === achievement.id);
  if (existingAchievement) return;
  
  // Añadir el logro
  this.achievements.push({
    ...achievement,
    achievedAt: new Date()
  });
  
  // Añadir puntos
  this.totalPoints += achievement.pointsAwarded;
  this.monthlyPoints += achievement.pointsAwarded;
  this.annualPoints += achievement.pointsAwarded;
  
  // Recalcular nivel
  this.level = Math.floor(this.totalPoints / 1000) + 1;
};

// Middleware para actualizar el nivel antes de guardar
UserStatsSchema.pre('save', function(next) {
  // Calcular nivel basado en puntos totales
  (this as any).level = Math.floor((this as any).totalPoints / 1000) + 1;
  
  // Calcular score de participación (ejemplo simple)
  (this as any).participationScore = Math.min((this as any).eventsAttended * 10, 100);
  
  next();
});

// Funciones auxiliares
function getNextMonthReset(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function getNextYearReset(): Date {
  const now = new Date();
  return new Date(now.getFullYear() + 1, 0, 1);
}

export default mongoose.models.UserStats || mongoose.model<IUserStats>('UserStats', UserStatsSchema);