import mongoose, { Document, Schema } from 'mongoose';

// Interfaces para subdocumentos
export interface IAdjunto {
  id: string;
  nombre: string;
  tamaño: number;
  tipo: string;
  url: string;
  fechaSubida: Date;
}

export interface IMensaje {
  id: string;
  contenido: string;
  tipo: 'usuario' | 'sistema' | 'admin';
  autorId?: string;
  autorNombre: string;
  fechaCreacion: Date;
  adjuntos?: IAdjunto[];
  esInterno?: boolean;
}

export interface ITimelineEvento {
  id: string;
  tipo: 'creada' | 'actualizada' | 'respondida' | 'cerrada' | 'escalada' | 'mensaje';
  descripcion: string;
  fecha: Date;
  autorId?: string;
  autorNombre?: string;
  metadata?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface IDatosBancariosReembolso {
  nombreTitular: string;
  tipoDocumento: 'CC' | 'CE' | 'NIT' | 'TI' | 'PA';
  numeroDocumento: string;
  banco: string;
  tipoCuenta: 'ahorros' | 'corriente';
  numeroCuenta: string;
  emailConfirmacion: string;
  telefonoContacto: string;
}

// Interface principal
export interface IPQRSDF extends Document {
  numeroSolicitud: string;
  usuarioId: string;
  categoria: 'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'denuncia' | 'felicitacion';
  subcategoria?: 'general' | 'reembolso' | 'cambio_datos' | 'certificado' | 'otro';
  asunto: string;
  descripcion: string;
  estado: 'en_revision' | 'respondida' | 'cerrada' | 'escalada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date;
  fechaLimiteRespuesta?: Date;
  adjuntos: IAdjunto[];
  mensajes: IMensaje[];
  timeline: ITimelineEvento[];
  asignadoA?: string;
  etiquetas?: string[];
  satisfaccion?: number;
  comentarioSatisfaccion?: string;
  // Campos específicos para reembolsos
  eventoId?: string;
  eventoNombre?: string;
  montoReembolso?: number;
  ordenPago?: string;
  datosBancarios?: IDatosBancariosReembolso;
}

// Esquema para datos bancarios
const DatosBancariosReembolsoSchema = new Schema<IDatosBancariosReembolso>({
  nombreTitular: { type: String, required: true },
  tipoDocumento: { 
    type: String, 
    enum: ['CC', 'CE', 'NIT', 'TI', 'PA'], 
    required: true 
  },
  numeroDocumento: { type: String, required: true },
  banco: { type: String, required: true },
  tipoCuenta: { 
    type: String, 
    enum: ['ahorros', 'corriente'], 
    required: true 
  },
  numeroCuenta: { type: String, required: true },
  emailConfirmacion: { type: String, required: true },
  telefonoContacto: { type: String, required: true }
});

// Esquemas para subdocumentos
const AdjuntoSchema = new Schema<IAdjunto>({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  tamaño: { type: Number, required: true },
  tipo: { type: String, required: true },
  url: { type: String, required: true },
  fechaSubida: { type: Date, required: true }
});

const MensajeSchema = new Schema<IMensaje>({
  id: { type: String, required: true },
  contenido: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['usuario', 'sistema', 'admin'], 
    required: true 
  },
  autorId: { type: String },
  autorNombre: { type: String, required: true },
  fechaCreacion: { type: Date, required: true },
  adjuntos: [AdjuntoSchema],
  esInterno: { type: Boolean, default: false }
});

const TimelineEventoSchema = new Schema<ITimelineEvento>({
  id: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['creada', 'actualizada', 'respondida', 'cerrada', 'escalada', 'mensaje'], 
    required: true 
  },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  autorId: { type: String },
  autorNombre: { type: String },
  metadata: { type: Schema.Types.Mixed }
});

// Esquema principal
const PQRSDFSchema = new Schema<IPQRSDF>({
  numeroSolicitud: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  usuarioId: { 
    type: String, 
    required: true,
    index: true
  },
  categoria: { 
    type: String, 
    enum: ['peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia', 'felicitacion'], 
    required: true,
    index: true
  },
  subcategoria: {
    type: String,
    enum: ['general', 'reembolso', 'cambio_datos', 'certificado', 'otro']
  },
  asunto: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  descripcion: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  estado: { 
    type: String, 
    enum: ['en_revision', 'respondida', 'cerrada', 'escalada'], 
    default: 'en_revision',
    index: true
  },
  prioridad: { 
    type: String, 
    enum: ['baja', 'media', 'alta', 'urgente'], 
    default: 'media',
    index: true
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaCierre: { type: Date },
  fechaLimiteRespuesta: { type: Date },
  adjuntos: [AdjuntoSchema],
  mensajes: [MensajeSchema],
  timeline: [TimelineEventoSchema],
  asignadoA: { type: String },
  etiquetas: [{ type: String }],
  satisfaccion: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  comentarioSatisfaccion: { 
    type: String, 
    maxlength: 500 
  },
  // Campos de reembolso
  eventoId: { type: String },
  eventoNombre: { type: String },
  montoReembolso: { type: Number },
  ordenPago: { type: String },
  datosBancarios: { type: DatosBancariosReembolsoSchema }
}, {
  timestamps: true,
  collection: 'pqrsdf'
});

// Índices compuestos
PQRSDFSchema.index({ usuarioId: 1, fechaCreacion: -1 });
PQRSDFSchema.index({ estado: 1, prioridad: 1 });
PQRSDFSchema.index({ categoria: 1, estado: 1 });

// Middleware para actualizar fechaActualizacion
PQRSDFSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Interface para el modelo (incluye métodos estáticos)
export interface IPQRSDFModel extends mongoose.Model<IPQRSDF> {
  generarNumeroSolicitud(): Promise<string>;
}

// Método estático para generar número de solicitud
PQRSDFSchema.statics.generarNumeroSolicitud = async function(): Promise<string> {
  const año = new Date().getFullYear();
  const count = await this.countDocuments({
    numeroSolicitud: { $regex: `^PQRS-${año}-` }
  });
  const numero = String(count + 1).padStart(4, '0');
  return `PQRS-${año}-${numero}`;
};

// Método para agregar mensaje
PQRSDFSchema.methods.agregarMensaje = function(mensaje: Omit<IMensaje, 'id'>) {
  const nuevoMensaje: IMensaje = {
    ...mensaje,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  };
  
  this.mensajes.push(nuevoMensaje);
  
  // Agregar evento al timeline
  const timelineEvento: ITimelineEvento = {
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    tipo: 'mensaje',
    descripcion: `Nuevo mensaje de ${mensaje.autorNombre}`,
    fecha: new Date(),
    autorId: mensaje.autorId,
    autorNombre: mensaje.autorNombre
  };
  
  this.timeline.push(timelineEvento);
  return nuevoMensaje;
};

// Método para cambiar estado
PQRSDFSchema.methods.cambiarEstado = function(
  nuevoEstado: IPQRSDF['estado'], 
  autorId: string, 
  autorNombre: string, 
  descripcion?: string
) {
  const estadoAnterior = this.estado;
  this.estado = nuevoEstado;
  
  if (nuevoEstado === 'cerrada') {
    this.fechaCierre = new Date();
  }
  
  // Mapear estado a tipo de timeline
  let tipoTimeline: ITimelineEvento['tipo'];
  switch (nuevoEstado) {
    case 'respondida':
    case 'cerrada':
    case 'escalada':
      tipoTimeline = nuevoEstado;
      break;
    default:
      tipoTimeline = 'actualizada';
  }
  
  const timelineEvento: ITimelineEvento = {
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    tipo: tipoTimeline,
    descripcion: descripcion || `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`,
    fecha: new Date(),
    autorId,
    autorNombre
  };
  
  this.timeline.push(timelineEvento);
};

// Exportar modelo
export default (mongoose.models.PQRSDF || mongoose.model<IPQRSDF, IPQRSDFModel>('PQRSDF', PQRSDFSchema)) as IPQRSDFModel;