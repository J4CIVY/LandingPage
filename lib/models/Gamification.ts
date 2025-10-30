import mongoose, { Schema, Document } from 'mongoose';

// Interface para Transacciones de Puntos
export interface ITransaccionPuntos extends Document {
  usuarioId: mongoose.Types.ObjectId;
  tipo: 'ganancia' | 'canje' | 'bonificacion' | 'penalizacion';
  cantidad: number;
  razon: string;
  metadata?: {
    eventoId?: mongoose.Types.ObjectId;
    recompensaId?: mongoose.Types.ObjectId;
    accionTipo?: string;
    detalles?: string;
  };
  fechaTransaccion: Date;
  activo: boolean;
}

const TransaccionPuntosSchema = new Schema<ITransaccionPuntos>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['ganancia', 'canje', 'bonificacion', 'penalizacion'],
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  razon: {
    type: String,
    required: true,
    maxlength: 255
  },
  metadata: {
    eventoId: { type: Schema.Types.ObjectId, ref: 'Event' },
    recompensaId: { type: Schema.Types.ObjectId, ref: 'Recompensa' },
    accionTipo: String,
    detalles: String
  },
  fechaTransaccion: {
    type: Date,
    default: Date.now,
    index: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'transacciones_puntos'
});

// Índices para optimizar consultas
TransaccionPuntosSchema.index({ usuarioId: 1, fechaTransaccion: -1 });
TransaccionPuntosSchema.index({ tipo: 1 });

export const TransaccionPuntos = mongoose.models.TransaccionPuntos || 
  mongoose.model<ITransaccionPuntos>('TransaccionPuntos', TransaccionPuntosSchema);

// Interface para Recompensas
export interface IRecompensa extends Document {
  nombre: string;
  descripcion: string;
  imagen?: string;
  costoPuntos: number;
  categoria: 'merchandising' | 'descuentos' | 'eventos' | 'digital' | 'experiencias';
  disponible: boolean;
  stock?: number;
  stockInicial?: number;
  validoDesde: Date;
  validoHasta?: Date;
  condiciones?: string;
  metadata?: {
    proveedor?: string;
    codigoProducto?: string;
    valorReal?: number;
    restricciones?: string[];
  };
  canjesPendientes: number;
  canjesCompletados: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const RecompensaSchema = new Schema<IRecompensa>({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 500
  },
  imagen: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        
        try {
          const url = new URL(v);
          const hostname = url.hostname;
          
          // Lista de hostnames permitidos de Cloudinary
          const allowedHosts = [
            'cloudinary.com',
            'res.cloudinary.com'
          ];
          
          // Verificar hostname exacto o subdominios válidos de cloudinary.com
          return allowedHosts.includes(hostname) || hostname.endsWith('.cloudinary.com');
        } catch {
          // Si la URL no se puede parsear, es inválida
          return false;
        }
      },
      message: 'La imagen debe ser una URL válida de Cloudinary'
    }
  },
  costoPuntos: {
    type: Number,
    required: true,
    min: 1
  },
  categoria: {
    type: String,
    enum: ['merchandising', 'descuentos', 'eventos', 'digital', 'experiencias'],
    required: true
  },
  disponible: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: null // null = stock ilimitado
  },
  stockInicial: {
    type: Number,
    default: null
  },
  validoDesde: {
    type: Date,
    default: Date.now
  },
  validoHasta: {
    type: Date,
    default: null // null = no expira
  },
  condiciones: {
    type: String,
    maxlength: 1000
  },
  metadata: {
    proveedor: String,
    codigoProducto: String,
    valorReal: Number,
    restricciones: [String]
  },
  canjesPendientes: {
    type: Number,
    default: 0
  },
  canjesCompletados: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  collection: 'recompensas'
});

// Índices
RecompensaSchema.index({ categoria: 1, disponible: 1 });
RecompensaSchema.index({ costoPuntos: 1 });
RecompensaSchema.index({ validoDesde: 1, validoHasta: 1 });

export const Recompensa = mongoose.models.Recompensa || 
  mongoose.model<IRecompensa>('Recompensa', RecompensaSchema);

// Interface para Canjes de Recompensas
export interface ICanjeRecompensa extends Document {
  usuarioId: mongoose.Types.ObjectId;
  recompensaId: mongoose.Types.ObjectId;
  puntosUtilizados: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
  fechaCanje: Date;
  fechaEntrega?: Date;
  fechaCancelacion?: Date;
  motivoCancelacion?: string;
  informacionEntrega?: {
    direccion?: string;
    telefono?: string;
    notas?: string;
    trackingNumber?: string;
  };
  procesadoPor?: mongoose.Types.ObjectId;
}

const CanjeRecompensaSchema = new Schema<ICanjeRecompensa>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recompensaId: {
    type: Schema.Types.ObjectId,
    ref: 'Recompensa',
    required: true
  },
  puntosUtilizados: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  fechaCanje: {
    type: Date,
    default: Date.now
  },
  fechaEntrega: Date,
  fechaCancelacion: Date,
  motivoCancelacion: String,
  informacionEntrega: {
    direccion: String,
    telefono: String,
    notas: String,
    trackingNumber: String
  },
  procesadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'canjes_recompensas'
});

// Índices
CanjeRecompensaSchema.index({ usuarioId: 1, fechaCanje: -1 });
CanjeRecompensaSchema.index({ estado: 1 });
CanjeRecompensaSchema.index({ recompensaId: 1 });

export const CanjeRecompensa = mongoose.models.CanjeRecompensa || 
  mongoose.model<ICanjeRecompensa>('CanjeRecompensa', CanjeRecompensaSchema);

// Interface para Estadísticas de Usuario (extendida)
export interface IEstadisticasUsuario extends Document {
  usuarioId: mongoose.Types.ObjectId;
  puntos: {
    total: number;
    ganados: number;
    canjeados: number;
    pendientes: number;
    hoy: number;
    esteMes: number;
    esteAno: number;
  };
  eventos: {
    registrados: number;
    asistidos: number;
    favoritos: number;
    organizados: number;
    cancelados: number;
  };
  actividad: {
    diasActivo: number;
    ultimaConexion: Date;
    rachaActual: number;
    mejorRacha: number;
    interacciones: number;
  };
  ranking: {
    posicionActual: number;
    posicionAnterior: number;
    mejorPosicion: number;
    cambioSemanal: number;
  };
  nivel: {
    actual: string;
    puntosSiguienteNivel: number;
    progreso: number;
    experienciaTotal: number;
  };
  logros: {
    total: number;
    ultimoLogro?: {
      nombre: string;
      fecha: Date;
    };
    proximoLogro?: {
      nombre: string;
      progreso: number;
    };
  };
  fechaActualizacion: Date;
}

const EstadisticasUsuarioSchema = new Schema<IEstadisticasUsuario>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  puntos: {
    total: { type: Number, default: 0 },
    ganados: { type: Number, default: 0 },
    canjeados: { type: Number, default: 0 },
    pendientes: { type: Number, default: 0 },
    hoy: { type: Number, default: 0 },
    esteMes: { type: Number, default: 0 },
    esteAno: { type: Number, default: 0 }
  },
  eventos: {
    registrados: { type: Number, default: 0 },
    asistidos: { type: Number, default: 0 },
    favoritos: { type: Number, default: 0 },
    organizados: { type: Number, default: 0 },
    cancelados: { type: Number, default: 0 }
  },
  actividad: {
    diasActivo: { type: Number, default: 0 },
    ultimaConexion: { type: Date, default: Date.now },
    rachaActual: { type: Number, default: 0 },
    mejorRacha: { type: Number, default: 0 },
    interacciones: { type: Number, default: 0 }
  },
  ranking: {
    posicionActual: { type: Number, default: 0 },
    posicionAnterior: { type: Number, default: 0 },
    mejorPosicion: { type: Number, default: 0 },
    cambioSemanal: { type: Number, default: 0 }
  },
  nivel: {
    actual: { type: String, default: 'Novato' },
    puntosSiguienteNivel: { type: Number, default: 100 },
    progreso: { type: Number, default: 0 },
    experienciaTotal: { type: Number, default: 0 }
  },
  logros: {
    total: { type: Number, default: 0 },
    ultimoLogro: {
      nombre: String,
      fecha: Date
    },
    proximoLogro: {
      nombre: String,
      progreso: Number
    }
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'estadisticas_usuarios'
});

// Índices
EstadisticasUsuarioSchema.index({ 'puntos.total': -1 });
EstadisticasUsuarioSchema.index({ 'ranking.posicionActual': 1 });
EstadisticasUsuarioSchema.index({ 'nivel.actual': 1 });

export const EstadisticasUsuario = mongoose.models.EstadisticasUsuario || 
  mongoose.model<IEstadisticasUsuario>('EstadisticasUsuario', EstadisticasUsuarioSchema);