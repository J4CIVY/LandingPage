import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el logro
export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: 'Actividad' | 'Puntos' | 'Social' | 'Especial';
  condiciones: {
    tipo: 'puntos_acumulados' | 'recompensas_canjeadas' | 'eventos_participados' | 'meses_activo' | 'ranking_posicion' | 'nivel_alcanzado';
    valor: number;
    operador?: 'mayor_igual' | 'igual' | 'menor_igual';
  };
  recompensa?: {
    puntos?: number;
    item?: string;
  };
  activo: boolean;
  orden: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaz para el logro del usuario
export interface IUserAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  usuarioId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  desbloqueado: boolean;
  fechaDesbloqueo?: Date;
  progreso: {
    actual: number;
    total: number;
  };
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Schema para logros
const AchievementSchema = new Schema<IAchievement>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  icono: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['Actividad', 'Puntos', 'Social', 'Especial'],
    required: true,
    index: true
  },
  condiciones: {
    tipo: {
      type: String,
      enum: ['puntos_acumulados', 'recompensas_canjeadas', 'eventos_participados', 'meses_activo', 'ranking_posicion', 'nivel_alcanzado'],
      required: true
    },
    valor: {
      type: Number,
      required: true
    },
    operador: {
      type: String,
      enum: ['mayor_igual', 'igual', 'menor_igual'],
      default: 'mayor_igual'
    }
  },
  recompensa: {
    puntos: {
      type: Number,
      default: 0
    },
    item: {
      type: String
    }
  },
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  orden: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Schema para logros de usuario
const UserAchievementSchema = new Schema<IUserAchievement>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
    index: true
  },
  desbloqueado: {
    type: Boolean,
    default: false,
    index: true
  },
  fechaDesbloqueo: {
    type: Date
  },
  progreso: {
    actual: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Índices compuestos
UserAchievementSchema.index({ usuarioId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ usuarioId: 1, desbloqueado: 1 });

// Middleware pre-save para actualizar fechaActualizacion
AchievementSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

UserAchievementSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Modelos
export const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UserAchievement = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);