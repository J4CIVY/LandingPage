// Tipos para el sistema PQRSDF

export type SolicitudCategoria = 
  | 'peticion' 
  | 'queja' 
  | 'reclamo' 
  | 'sugerencia' 
  | 'denuncia' 
  | 'felicitacion';

export type SolicitudEstado = 
  | 'en_revision' 
  | 'respondida' 
  | 'cerrada' 
  | 'escalada';

export type MensajeTipo = 'usuario' | 'sistema' | 'admin';

export interface Adjunto {
  id: string;
  nombre: string;
  tamaño: number;
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
  esInterno?: boolean; // Para mensajes internos del sistema
}

export interface TimelineEvento {
  id: string;
  solicitudId: string;
  tipo: 'creada' | 'actualizada' | 'respondida' | 'cerrada' | 'escalada' | 'mensaje';
  descripcion: string;
  fecha: Date;
  autorId?: string;
  autorNombre?: string;
  metadata?: Record<string, any>;
}

export interface Solicitud {
  id: string;
  numeroSolicitud: string; // Formato: PQRS-2025-0001
  usuarioId: string;
  categoria: SolicitudCategoria;
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
  asignadoA?: string; // ID del administrador asignado
  etiquetas?: string[];
  satisfaccion?: number; // Calificación de 1-5
  comentarioSatisfaccion?: string;
}

export interface CrearSolicitudDto {
  categoria: SolicitudCategoria;
  asunto: string;
  descripcion: string;
  adjuntos?: File[];
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
  tiempoPromedioRespuesta: number; // en horas
  satisfaccionPromedio: number;
}

// Constantes para el sistema
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