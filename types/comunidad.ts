export interface Publicacion {
  id: string;
  autorId: string;
  autor: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  contenido: string;
  imagenes?: string[];
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  reacciones: {
    meGusta: string[]; // IDs de usuarios
    corazones: string[];
    fuego: string[];
  };
  comentarios: Comentario[];
  grupoId?: string; // Si está en un grupo específico
  esEditado: boolean;
}

export interface Comentario {
  id: string;
  publicacionId: string;
  autorId: string;
  autor: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  contenido: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  comentarioPadreId?: string; // Para respuestas a comentarios
  respuestas: Comentario[];
  reacciones: {
    meGusta: string[];
  };
}

export interface GrupoInteres {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  miembros: string[]; // IDs de usuarios
  adminId: string;
  fechaCreacion: Date;
  esPrivado: boolean;
  publicaciones: Publicacion[];
}

export interface ChatMensaje {
  id: string;
  autorId: string;
  autor: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  contenido: string;
  fechaEnvio: Date;
  editado: boolean;
  tipo: 'texto' | 'imagen' | 'archivo';
  grupoId?: string; // Si es un chat de grupo específico
}

export interface UsuarioRanking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  puntos: {
    publicaciones: number;
    comentarios: number;
    reaccionesRecibidas: number;
    participacionEventos: number;
    total: number;
  };
  insignias: Insignia[];
  posicion: number;
  nivel: string; // 'Novato', 'Colaborador', 'Motociclista Activo', 'Leyenda BSKMT'
}

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
  fechaObtenida: Date;
}

export interface ReporteContenido {
  id: string;
  reportadorId: string;
  contenidoId: string;
  tipoContenido: 'publicacion' | 'comentario' | 'mensaje';
  motivo: string;
  descripcion?: string;
  estado: 'pendiente' | 'revisado' | 'resuelto' | 'rechazado';
  fechaReporte: Date;
  fechaResolucion?: Date;
  moderadorId?: string;
}

export interface ConfiguracionModerador {
  usuarioId: string;
  permisos: {
    eliminarPublicaciones: boolean;
    eliminarComentarios: boolean;
    suspenderUsuarios: boolean;
    gestionarGrupos: boolean;
    revisarReportes: boolean;
  };
}

export interface NotificacionComunidad {
  id: string;
  usuarioId: string;
  tipo: 'nueva_publicacion' | 'comentario' | 'reaccion' | 'mencion' | 'grupo_nuevo' | 'mensaje_chat';
  titulo: string;
  mensaje: string;
  enlace?: string;
  leida: boolean;
  fechaCreacion: Date;
  datos?: {
    publicacionId?: string;
    comentarioId?: string;
    grupoId?: string;
    autorId?: string;
  };
}

export interface EstadisticasComunidad {
  totalPublicaciones: number;
  totalComentarios: number;
  totalReacciones: number;
  totalGrupos: number;
  miembrosActivos: number; // Últimos 30 días
  publicacionesHoy: number;
  comentariosHoy: number;
  grupoMasActivo: {
    id: string;
    nombre: string;
    actividad: number;
  };
  usuarioMasActivo: {
    id: string;
    nombre: string;
    puntos: number;
  };
}

// Tipos para formularios
export interface FormularioPublicacion {
  contenido: string;
  imagenes: File[];
  grupoId?: string;
}

export interface FormularioComentario {
  contenido: string;
  publicacionId: string;
  comentarioPadreId?: string;
}

export interface FormularioGrupo {
  nombre: string;
  descripcion: string;
  icono: string;
  esPrivado: boolean;
}

export interface FormularioReporte {
  contenidoId: string;
  tipoContenido: 'publicacion' | 'comentario' | 'mensaje';
  motivo: string;
  descripcion?: string;
}

// Estados de carga y errores
export interface EstadoCarga {
  cargando: boolean;
  error: string | null;
  exito: boolean;
}

export interface RespuestaAPI<T> {
  exito: boolean;
  datos?: T;
  mensaje?: string;
  error?: string;
}

export interface UsuarioEnLinea {
  id: string;
  nombre: string;
  avatar?: string;
  ultimaActividad: Date | string;
  enLinea?: boolean;
}