// Interfaces para el sistema de historial del miembro

export interface HistorialItem {
  id: string;
  tipo: "Evento" | "Membresía" | "PQRSDF" | "Beneficio" | "Reconocimiento";
  fecha: string; // ISO date string
  descripcion: string;
  estado?: "activo" | "cerrado" | "completado" | "vencido" | "pendiente" | "rechazado";
  referencia?: string; // id de evento, pqrs, etc.
  icono?: string;
  colorIcon?: string;
  detalles?: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- Información específica según el tipo
}

export interface EventoHistorial {
  id: string;
  nombre: string;
  fecha: string;
  fechaInscripcion: string;
  estado: "inscrito" | "asistio" | "no_asistio" | "cancelado";
  rol: "participante" | "organizador" | "voluntario";
  ubicacion: string;
  tipo: "ruta" | "social" | "capacitacion" | "mantenimiento";
  puntos?: number;
}

export interface MembresiaHistorial {
  id: string;
  fechaAfiliacion: string;
  tipoMembresia: "basica" | "premium" | "vip";
  estado: "activa" | "vencida" | "suspendida" | "cancelada";
  fechaVencimiento: string;
  renovaciones: {
    fecha: string;
    tipo: string;
    monto: number;
  }[];
  beneficiosActivos: string[];
}

export interface PqrsdfHistorial {
  id: string;
  categoria: "peticion" | "queja" | "reclamo" | "sugerencia" | "denuncia" | "felicitacion";
  asunto: string;
  fechaCreacion: string;
  fechaRespuesta?: string;
  estado: "abierto" | "en_proceso" | "cerrado" | "respondido";
  prioridad: "baja" | "media" | "alta" | "urgente";
  numeroTicket: string;
}

export interface BeneficioHistorial {
  id: string;
  nombre: string;
  categoria: "descuento" | "producto_gratis" | "servicio" | "evento_especial";
  fechaUso: string;
  codigoAplicado?: string;
  qrCode?: string;
  valorOriginal: number;
  valorDescuento: number;
  valorFinal: number;
  establecimiento: string;
  estado: "usado" | "activo" | "vencido";
}

export interface LogroHistorial {
  id: string;
  nombre: string;
  descripcion: string;
  fechaObtencion: string;
  categoria: "participacion" | "liderazgo" | "seguridad" | "comunidad" | "especial";
  insignia?: string;
  puntos: number;
  nivel: "bronce" | "plata" | "oro" | "platino";
}

export interface FiltroHistorial {
  categoria: "Todos" | "Eventos" | "Membresía" | "Beneficios" | "PQRSDF" | "Reconocimientos";
  fechaInicio?: string;
  fechaFin?: string;
}

export interface EstadisticasHistorial {
  totalEventos: number;
  eventosAsistidos: number;
  beneficiosUsados: number;
  pqrsdfAbiertas: number;
  logrosObtenidos: number;
  anosMembresia: number;
  puntosAcumulados: number;
}