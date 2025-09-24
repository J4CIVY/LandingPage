import mongoose, { Schema, Document } from 'mongoose';

// Esquema para Publicaciones
export interface IPublicacion extends Document {
  autorId: mongoose.Types.ObjectId;
  contenido: string;
  imagenes?: string[];
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  reacciones: {
    meGusta: mongoose.Types.ObjectId[];
    corazones: mongoose.Types.ObjectId[];
    fuego: mongoose.Types.ObjectId[];
  };
  grupoId?: mongoose.Types.ObjectId;
  esEditado: boolean;
  activa: boolean;
}

const PublicacionSchema = new Schema<IPublicacion>({
  autorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    maxlength: 5000
  },
  imagenes: [{
    type: String
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date
  },
  reacciones: {
    meGusta: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    corazones: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    fuego: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  grupoId: {
    type: Schema.Types.ObjectId,
    ref: 'GrupoInteres'
  },
  esEditado: {
    type: Boolean,
    default: false
  },
  activa: {
    type: Boolean,
    default: true
  }
});

// Índices para mejor rendimiento
PublicacionSchema.index({ fechaCreacion: -1 });
PublicacionSchema.index({ autorId: 1 });
PublicacionSchema.index({ grupoId: 1 });

export const Publicacion = mongoose.models.Publicacion || mongoose.model<IPublicacion>('Publicacion', PublicacionSchema);

// Esquema para Comentarios
export interface IComentario extends Document {
  publicacionId: mongoose.Types.ObjectId;
  autorId: mongoose.Types.ObjectId;
  contenido: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  comentarioPadreId?: mongoose.Types.ObjectId;
  reacciones: {
    meGusta: mongoose.Types.ObjectId[];
  };
  activo: boolean;
}

const ComentarioSchema = new Schema<IComentario>({
  publicacionId: {
    type: Schema.Types.ObjectId,
    ref: 'Publicacion',
    required: true
  },
  autorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    maxlength: 1000
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date
  },
  comentarioPadreId: {
    type: Schema.Types.ObjectId,
    ref: 'Comentario'
  },
  reacciones: {
    meGusta: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Índices
ComentarioSchema.index({ publicacionId: 1, fechaCreacion: 1 });
ComentarioSchema.index({ autorId: 1 });

export const Comentario = mongoose.models.Comentario || mongoose.model<IComentario>('Comentario', ComentarioSchema);

// Esquema para Grupos de Interés
export interface IGrupoInteres extends Document {
  nombre: string;
  descripcion: string;
  icono: string;
  miembros: mongoose.Types.ObjectId[];
  adminId: mongoose.Types.ObjectId;
  fechaCreacion: Date;
  esPrivado: boolean;
  activo: boolean;
}

const GrupoInteresSchema = new Schema<IGrupoInteres>({
  nombre: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 500
  },
  icono: {
    type: String,
    required: true
  },
  miembros: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  esPrivado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  }
});

export const GrupoInteres = mongoose.models.GrupoInteres || mongoose.model<IGrupoInteres>('GrupoInteres', GrupoInteresSchema);

// Esquema para Mensajes de Chat
export interface IChatMensaje extends Document {
  autorId: mongoose.Types.ObjectId;
  contenido: string;
  fechaEnvio: Date;
  editado: boolean;
  tipo: 'texto' | 'imagen' | 'archivo';
  grupoId?: mongoose.Types.ObjectId;
  activo: boolean;
}

const ChatMensajeSchema = new Schema<IChatMensaje>({
  autorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    maxlength: 1000
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  },
  editado: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    enum: ['texto', 'imagen', 'archivo'],
    default: 'texto'
  },
  grupoId: {
    type: Schema.Types.ObjectId,
    ref: 'GrupoInteres'
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Índices
ChatMensajeSchema.index({ fechaEnvio: -1 });
ChatMensajeSchema.index({ grupoId: 1, fechaEnvio: -1 });

export const ChatMensaje = mongoose.models.ChatMensaje || mongoose.model<IChatMensaje>('ChatMensaje', ChatMensajeSchema);

// Esquema para Sistema de Puntos y Ranking
export interface IUsuarioRanking extends Document {
  usuarioId: mongoose.Types.ObjectId;
  puntos: {
    publicaciones: number;
    comentarios: number;
    reaccionesRecibidas: number;
    participacionEventos: number;
    total: number;
  };
  insignias: {
    nombre: string;
    descripcion: string;
    icono: string;
    criterio: string;
    fechaObtenida: Date;
  }[];
  nivel: string;
  fechaActualizacion: Date;
}

const UsuarioRankingSchema = new Schema<IUsuarioRanking>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  puntos: {
    publicaciones: { type: Number, default: 0 },
    comentarios: { type: Number, default: 0 },
    reaccionesRecibidas: { type: Number, default: 0 },
    participacionEventos: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  insignias: [{
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    icono: { type: String, required: true },
    criterio: { type: String, required: true },
    fechaObtenida: { type: Date, default: Date.now }
  }],
  nivel: {
    type: String,
    enum: ['aspirante', 'explorador', 'participante', 'friend', 'rider', 'pro', 'legend', 'master', 'volunteer', 'leader'],
    default: 'aspirante'
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Índices
UsuarioRankingSchema.index({ 'puntos.total': -1 });
UsuarioRankingSchema.index({ nivel: 1 });

export const UsuarioRanking = mongoose.models.UsuarioRanking || mongoose.model<IUsuarioRanking>('UsuarioRanking', UsuarioRankingSchema);

// Esquema para Reportes de Contenido
export interface IReporteContenido extends Document {
  reportadorId: mongoose.Types.ObjectId;
  contenidoId: mongoose.Types.ObjectId;
  tipoContenido: 'publicacion' | 'comentario' | 'mensaje';
  motivo: string;
  descripcion?: string;
  estado: 'pendiente' | 'revisado' | 'resuelto' | 'rechazado';
  fechaReporte: Date;
  fechaResolucion?: Date;
  moderadorId?: mongoose.Types.ObjectId;
}

const ReporteContenidoSchema = new Schema<IReporteContenido>({
  reportadorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenidoId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  tipoContenido: {
    type: String,
    enum: ['publicacion', 'comentario', 'mensaje'],
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    maxlength: 500
  },
  estado: {
    type: String,
    enum: ['pendiente', 'revisado', 'resuelto', 'rechazado'],
    default: 'pendiente'
  },
  fechaReporte: {
    type: Date,
    default: Date.now
  },
  fechaResolucion: {
    type: Date
  },
  moderadorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Índices
ReporteContenidoSchema.index({ estado: 1, fechaReporte: -1 });
ReporteContenidoSchema.index({ moderadorId: 1 });

export const ReporteContenido = mongoose.models.ReporteContenido || mongoose.model<IReporteContenido>('ReporteContenido', ReporteContenidoSchema);

// Esquema para Notificaciones de Comunidad
export interface INotificacionComunidad extends Document {
  usuarioId: mongoose.Types.ObjectId;
  tipo: 'nueva_publicacion' | 'comentario' | 'reaccion' | 'mencion' | 'grupo_nuevo' | 'mensaje_chat';
  titulo: string;
  mensaje: string;
  enlace?: string;
  leida: boolean;
  fechaCreacion: Date;
  datos?: {
    publicacionId?: mongoose.Types.ObjectId;
    comentarioId?: mongoose.Types.ObjectId;
    grupoId?: mongoose.Types.ObjectId;
    autorId?: mongoose.Types.ObjectId;
  };
}

const NotificacionComunidadSchema = new Schema<INotificacionComunidad>({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['nueva_publicacion', 'comentario', 'reaccion', 'mencion', 'grupo_nuevo', 'mensaje_chat'],
    required: true
  },
  titulo: {
    type: String,
    required: true,
    maxlength: 100
  },
  mensaje: {
    type: String,
    required: true,
    maxlength: 300
  },
  enlace: {
    type: String
  },
  leida: {
    type: Boolean,
    default: false
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  datos: {
    publicacionId: { type: Schema.Types.ObjectId, ref: 'Publicacion' },
    comentarioId: { type: Schema.Types.ObjectId, ref: 'Comentario' },
    grupoId: { type: Schema.Types.ObjectId, ref: 'GrupoInteres' },
    autorId: { type: Schema.Types.ObjectId, ref: 'User' }
  }
});

// Índices
NotificacionComunidadSchema.index({ usuarioId: 1, fechaCreacion: -1 });
NotificacionComunidadSchema.index({ leida: 1 });

export const NotificacionComunidad = mongoose.models.NotificacionComunidad || mongoose.model<INotificacionComunidad>('NotificacionComunidad', NotificacionComunidadSchema);