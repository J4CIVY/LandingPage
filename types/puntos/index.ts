export interface PuntosActividad {
  id: string;
  fecha: string;
  tipo: "Evento" | "Membresía" | "Beneficio" | "Comunidad" | "Otro";
  descripcion: string;
  puntos: number;
  saldo: number;
}

export interface Recompensa {
  id: string;
  nombre: string;
  descripcion: string;
  costoPuntos: number;
  disponible: boolean;
  imagen: string;
  nivelMinimo?: number;
  categoria: "Producto" | "Servicio" | "Experiencia" | "Descuento";
  stock?: number;
}

export interface Nivel {
  id: number;
  nombre: string;
  puntosMinimos: number;
  puntosMaximos: number;
  color: string;
  icono: string;
  beneficios: string[];
}

export interface Usuario {
  id: string;
  nombre: string;
  alias?: string;
  puntosTotales: number;
  nivel: Nivel;
  posicionRanking: number;
  avatar?: string;
  esAdmin?: boolean;
  progresoNivel?: number; // Progreso calculado por el servidor (0-100)
}

export interface CanjeRecompensa {
  id: string;
  recompensaId: string;
  usuarioId: string;
  fecha: string;
  puntosGastados: number;
  estado: "Pendiente" | "Completado" | "Cancelado";
}

export interface EstadisticasAdmin {
  puntosGeneradosMes: number;
  recompensasMasCanjeadas: Array<{
    recompensa: Recompensa;
    cantidad: number;
  }>;
  topMiembrosActivos: Usuario[];
  totalCanjes: number;
  totalPuntosCirculacion: number;
}

export interface FiltroHistorial {
  tipo?: PuntosActividad["tipo"];
  fechaInicio?: string;
  fechaFin?: string;
}

export interface FiltroPeriodo {
  periodo: "Mensual" | "Anual" | "Histórico";
  mes?: number;
  año?: number;
}

export type NotificacionTipo = "success" | "error" | "warning" | "info";

export interface Notificacion {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  duracion?: number;
}