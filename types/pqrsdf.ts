
export type SolicitudCategoria = 
  | 'peticion' 
  | 'queja' 
  | 'reclamo' 
  | 'sugerencia' 
  | 'denuncia' 
  | 'felicitacion';

export type SolicitudSubcategoria =
  | 'general'
  | 'reembolso'
  | 'cambio_datos'
  | 'certificado'
  | 'otro';

export type SolicitudEstado = 
  | 'en_revision' 
  | 'respondida' 
  | 'cerrada' 
  | 'escalada';

export type MensajeTipo = 'usuario' | 'sistema' | 'admin';

export interface DatosBancariosReembolso {
  nombreTitular: string;
  tipoDocumento: 'CC' | 'CE' | 'NIT' | 'TI' | 'PA';
  numeroDocumento: string;
  banco: string;
  tipoCuenta: 'ahorros' | 'corriente';
  numeroCuenta: string;
  emailConfirmacion: string;
  telefonoContacto: string;
}

export interface Adjunto {
  id: string;
  nombre: string;
  tamano: number;
  tipo: string;
  url: string;
  fechaSubida: Date;
}

export interface Mensaje {
  id: string;
  solicitudId: string;
  contenido: string;
  tipo: MensajeTipo;
  autorId?: string;
  autorNombre: string;
  fechaCreacion: Date;
  adjuntos?: Adjunto[];
  esInterno?: boolean;
}

export interface TimelineEvento {
  id: string;
  solicitudId: string;
  tipo: 'creada' | 'actualizada' | 'respondida' | 'cerrada' | 'escalada' | 'mensaje';
  descripcion: string;
  fecha: Date;
  autorId?: string;
  autorNombre?: string;
  metadata?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface Solicitud {
  id: string;
  numeroSolicitud: string;
  usuarioId: string;
  categoria: SolicitudCategoria;
  subcategoria?: SolicitudSubcategoria;
  asunto: string;
  descripcion: string;
  estado: SolicitudEstado;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date;
  fechaLimiteRespuesta?: Date;
  adjuntos: Adjunto[];
  mensajes: Mensaje[];
  timeline: TimelineEvento[];
  asignadoA?: string;
  etiquetas?: string[];
  satisfaccion?: number;
  comentarioSatisfaccion?: string;
  // Campos específicos para reembolsos
  eventoId?: string;
  eventoNombre?: string;
  montoReembolso?: number;
  ordenPago?: string;
  datosBancarios?: DatosBancariosReembolso;
}

export interface CrearSolicitudDto {
  categoria: SolicitudCategoria;
  subcategoria?: SolicitudSubcategoria;
  asunto: string;
  descripcion: string;
  adjuntos?: File[];
  // Campos para reembolsos
  eventoId?: string;
  eventoNombre?: string;
  montoReembolso?: number;
  ordenPago?: string;
  datosBancarios?: DatosBancariosReembolso;
}

export interface FiltroSolicitudes {
  categoria?: SolicitudCategoria;
  estado?: SolicitudEstado;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

export interface EstadisticasSolicitudes {
  total: number;
  porEstado: Record<SolicitudEstado, number>;
  porCategoria: Record<SolicitudCategoria, number>;
  tiempoPromedioRespuesta: number;
  satisfaccionPromedio: number;
}

// Constantes para el sistema (mantener si hay contexto útil)
export const CATEGORIAS_SOLICITUD: Record<SolicitudCategoria, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
  denuncia: 'Denuncia',
  felicitacion: 'Felicitación'
};

export const ESTADOS_SOLICITUD: Record<SolicitudEstado, string> = {
  en_revision: 'En Revisión',
  respondida: 'Respondida',
  cerrada: 'Cerrada',
  escalada: 'Escalada'
};

export const COLORES_ESTADO: Record<SolicitudEstado, string> = {
  en_revision: 'bg-blue-100 text-blue-800 border-blue-200',
  respondida: 'bg-green-100 text-green-800 border-green-200',
  cerrada: 'bg-gray-100 text-gray-800 border-gray-200',
  escalada: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export const ICONOS_CATEGORIA = {
  peticion: '📝',
  queja: '😞',
  reclamo: '⚠️',
  sugerencia: '💡',
  denuncia: '🚨',
  felicitacion: '👏'
};
