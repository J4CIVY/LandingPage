// Datos simulados para el sistema de historial del miembro
import type { 
  HistorialItem, 
  EventoHistorial, 
  MembresiaHistorial, 
  PqrsdfHistorial, 
  BeneficioHistorial, 
  LogroHistorial,
  EstadisticasHistorial 
} from '@/types/historial';

export const historialItemsSimulados: HistorialItem[] = [
  {
    id: '1',
    tipo: 'Evento',
    fecha: '2024-09-01T08:00:00Z',
    descripcion: 'Participación en Ruta del Café - Eje Cafetero',
    estado: 'completado',
    referencia: 'evento_001',
    detalles: {
      rol: 'participante',
      puntos: 50,
      ubicacion: 'Pereira, Risaralda'
    }
  },
  {
    id: '2',
    tipo: 'Beneficio',
    fecha: '2024-08-20T14:30:00Z',
    descripcion: 'Descuento 20% en mantenimiento - Taller MotoTech',
    estado: 'completado',
    referencia: 'beneficio_001',
    detalles: {
      ahorro: 50000,
      codigo: 'BSK20MANT'
    }
  },
  {
    id: '3',
    tipo: 'Membresía',
    fecha: '2024-03-15T10:00:00Z',
    descripcion: 'Renovación de membresía Premium por 1 año',
    estado: 'activo',
    referencia: 'membresia_001',
    detalles: {
      tipo: 'premium',
      vigencia: '2025-03-15'
    }
  },
  {
    id: '4',
    tipo: 'PQRSDF',
    fecha: '2024-07-10T09:15:00Z',
    descripcion: 'Sugerencia: Nueva ruta turística hacia Villa de Leyva',
    estado: 'cerrado',
    referencia: 'pqrs_001',
    detalles: {
      categoria: 'sugerencia',
      ticket: 'PQRS-2024-001'
    }
  },
  {
    id: '5',
    tipo: 'Reconocimiento',
    fecha: '2024-06-25T16:00:00Z',
    descripcion: 'Logro desbloqueado: Espíritu Aventurero',
    estado: 'completado',
    referencia: 'logro_001',
    detalles: {
      categoria: 'participacion',
      puntos: 100,
      nivel: 'oro'
    }
  }
];

export const eventosSimulados: EventoHistorial[] = [
  {
    id: '1',
    nombre: 'Ruta del Café - Eje Cafetero',
    fecha: '2024-09-01T08:00:00Z',
    fechaInscripcion: '2024-08-20T10:30:00Z',
    estado: 'asistio',
    rol: 'participante',
    ubicacion: 'Pereira, Risaralda',
    tipo: 'ruta',
    puntos: 50
  },
  {
    id: '2',
    nombre: 'Taller de Mantenimiento Básico',
    fecha: '2024-08-15T14:00:00Z',
    fechaInscripcion: '2024-08-10T16:45:00Z',
    estado: 'asistio',
    rol: 'participante',
    ubicacion: 'Sede BSK, Bogotá',
    tipo: 'capacitacion',
    puntos: 30
  },
  {
    id: '3',
    nombre: 'Encuentro Social - Parrillada',
    fecha: '2024-07-20T18:00:00Z',
    fechaInscripcion: '2024-07-15T12:00:00Z',
    estado: 'asistio',
    rol: 'organizador',
    ubicacion: 'Club Campestre La Sabana',
    tipo: 'social',
    puntos: 75
  },
  {
    id: '4',
    nombre: 'Ruta Nocturna por la Calera',
    fecha: '2024-07-05T19:00:00Z',
    fechaInscripcion: '2024-06-28T09:15:00Z',
    estado: 'no_asistio',
    rol: 'participante',
    ubicacion: 'La Calera, Cundinamarca',
    tipo: 'ruta',
    puntos: 0
  },
  {
    id: '5',
    nombre: 'Jornada de Limpieza de Motos',
    fecha: '2024-06-15T09:00:00Z',
    fechaInscripcion: '2024-06-10T14:20:00Z',
    estado: 'asistio',
    rol: 'voluntario',
    ubicacion: 'Sede BSK, Bogotá',
    tipo: 'mantenimiento',
    puntos: 40
  }
];

export const membresiaSimulada: MembresiaHistorial = {
  id: '1',
  fechaAfiliacion: '2022-03-15T10:00:00Z',
  tipoMembresia: 'premium',
  estado: 'activa',
  fechaVencimiento: '2025-03-15T23:59:59Z',
  renovaciones: [
    {
      fecha: '2024-03-15T10:00:00Z',
      tipo: 'premium',
      monto: 250000
    },
    {
      fecha: '2023-03-15T10:00:00Z',
      tipo: 'premium',
      monto: 200000
    },
    {
      fecha: '2022-03-15T10:00:00Z',
      tipo: 'basica',
      monto: 150000
    }
  ],
  beneficiosActivos: [
    'Descuentos en eventos especiales',
    'Acceso prioritario a rutas',
    'Kit de bienvenida premium',
    'Asesoría técnica gratuita',
    'Descuentos en aliados comerciales'
  ]
};

export const pqrsdfSimulados: PqrsdfHistorial[] = [
  {
    id: '1',
    categoria: 'sugerencia',
    asunto: 'Nueva ruta turística hacia Villa de Leyva',
    fechaCreacion: '2024-07-10T09:15:00Z',
    fechaRespuesta: '2024-07-12T14:30:00Z',
    estado: 'cerrado',
    prioridad: 'media',
    numeroTicket: 'PQRS-2024-001'
  },
  {
    id: '2',
    categoria: 'peticion',
    asunto: 'Solicitud de certificado de membresía',
    fechaCreacion: '2024-06-20T11:00:00Z',
    fechaRespuesta: '2024-06-21T16:45:00Z',
    estado: 'respondido',
    prioridad: 'baja',
    numeroTicket: 'PQRS-2024-002'
  },
  {
    id: '3',
    categoria: 'queja',
    asunto: 'Problemas con el proceso de inscripción a eventos',
    fechaCreacion: '2024-05-15T14:20:00Z',
    fechaRespuesta: '2024-05-16T10:15:00Z',
    estado: 'cerrado',
    prioridad: 'alta',
    numeroTicket: 'PQRS-2024-003'
  },
  {
    id: '4',
    categoria: 'felicitacion',
    asunto: 'Excelente organización del evento "Ruta del Café"',
    fechaCreacion: '2024-04-25T16:30:00Z',
    fechaRespuesta: '2024-04-26T09:00:00Z',
    estado: 'respondido',
    prioridad: 'baja',
    numeroTicket: 'PQRS-2024-004'
  },
  {
    id: '5',
    categoria: 'reclamo',
    asunto: 'Reembolso por evento cancelado',
    fechaCreacion: '2024-03-10T13:45:00Z',
    estado: 'en_proceso',
    prioridad: 'alta',
    numeroTicket: 'PQRS-2024-005'
  }
];

export const beneficiosSimulados: BeneficioHistorial[] = [
  {
    id: '1',
    nombre: 'Descuento 20% en mantenimiento',
    categoria: 'descuento',
    fechaUso: '2024-08-20T14:30:00Z',
    codigoAplicado: 'BSK20MANT',
    valorOriginal: 250000,
    valorDescuento: 50000,
    valorFinal: 200000,
    establecimiento: 'Taller MotoTech',
    estado: 'usado'
  },
  {
    id: '2',
    nombre: 'Almuerzo gratis en evento',
    categoria: 'producto_gratis',
    fechaUso: '2024-07-15T12:00:00Z',
    valorOriginal: 25000,
    valorDescuento: 25000,
    valorFinal: 0,
    establecimiento: 'Restaurante La Ruta',
    estado: 'usado'
  },
  {
    id: '3',
    nombre: 'Descuento 15% en llantas',
    categoria: 'descuento',
    fechaUso: '2024-06-10T16:45:00Z',
    codigoAplicado: 'BSK15LLANTAS',
    qrCode: 'QR_BSK_2024_003',
    valorOriginal: 400000,
    valorDescuento: 60000,
    valorFinal: 340000,
    establecimiento: 'Llantería Speed',
    estado: 'usado'
  },
  {
    id: '4',
    nombre: 'Lavado de moto premium gratis',
    categoria: 'servicio',
    fechaUso: '2024-05-25T10:15:00Z',
    valorOriginal: 35000,
    valorDescuento: 35000,
    valorFinal: 0,
    establecimiento: 'Lavadero BSK Premium',
    estado: 'usado'
  },
  {
    id: '5',
    nombre: 'Entrada gratis a track day',
    categoria: 'evento_especial',
    fechaUso: '2024-04-30T08:00:00Z',
    valorOriginal: 150000,
    valorDescuento: 150000,
    valorFinal: 0,
    establecimiento: 'Autódromo de Tocancipá',
    estado: 'usado'
  },
  {
    id: '6',
    nombre: 'Descuento 25% en accesorios',
    categoria: 'descuento',
    fechaUso: '2024-12-31T23:59:59Z',
    codigoAplicado: 'BSK25ACC',
    valorOriginal: 0,
    valorDescuento: 0,
    valorFinal: 0,
    establecimiento: 'Tienda Moto Accessories',
    estado: 'activo'
  }
];

export const logrosSimulados: LogroHistorial[] = [
  {
    id: '1',
    nombre: 'Espíritu Aventurero',
    descripcion: 'Completa 10 rutas diferentes en el año',
    fechaObtencion: '2024-06-25T16:00:00Z',
    categoria: 'participacion',
    insignia: 'aventurero_oro.png',
    puntos: 100,
    nivel: 'oro'
  },
  {
    id: '2',
    nombre: 'Líder de Grupo',
    descripcion: 'Organiza exitosamente 5 eventos del motoclub',
    fechaObtencion: '2024-05-15T10:30:00Z',
    categoria: 'liderazgo',
    insignia: 'lider_platino.png',
    puntos: 150,
    nivel: 'platino'
  },
  {
    id: '3',
    nombre: 'Conductor Seguro',
    descripcion: 'Completa curso de manejo defensivo y 50 rutas sin incidentes',
    fechaObtencion: '2024-04-10T14:20:00Z',
    categoria: 'seguridad',
    insignia: 'seguridad_oro.png',
    puntos: 120,
    nivel: 'oro'
  },
  {
    id: '4',
    nombre: 'Embajador BSK',
    descripcion: 'Refiere 3 nuevos miembros que completen su primera renovación',
    fechaObtencion: '2024-03-20T11:15:00Z',
    categoria: 'comunidad',
    insignia: 'embajador_plata.png',
    puntos: 80,
    nivel: 'plata'
  },
  {
    id: '5',
    nombre: 'Veterano BSK',
    descripcion: 'Cumple 2 años como miembro activo del motoclub',
    fechaObtencion: '2024-03-15T00:00:00Z',
    categoria: 'especial',
    insignia: 'veterano_oro.png',
    puntos: 200,
    nivel: 'oro'
  },
  {
    id: '6',
    nombre: 'Mecánico de Ruta',
    descripcion: 'Ayuda a reparar motos de compañeros en 3 ocasiones diferentes',
    fechaObtencion: '2024-02-28T17:45:00Z',
    categoria: 'comunidad',
    insignia: 'mecanico_bronce.png',
    puntos: 60,
    nivel: 'bronce'
  },
  {
    id: '7',
    nombre: 'Explorador de Caminos',
    descripcion: 'Descubre y reporta 5 nuevas rutas para el motoclub',
    fechaObtencion: '2024-01-15T13:30:00Z',
    categoria: 'participacion',
    insignia: 'explorador_plata.png',
    puntos: 90,
    nivel: 'plata'
  }
];

export const estadisticasSimuladas: EstadisticasHistorial = {
  totalEventos: 24,
  eventosAsistidos: 18,
  beneficiosUsados: 12,
  pqrsdfAbiertas: 1,
  logrosObtenidos: 7,
  añosMembresia: 3,
  puntosAcumulados: 800
};

// Función para generar datos simulados de desarrollo
export const generarDatosSimulados = () => {
  return {
    historialItems: historialItemsSimulados,
    eventos: eventosSimulados,
    membresia: membresiaSimulada,
    pqrsdf: pqrsdfSimulados,
    beneficios: beneficiosSimulados,
    logros: logrosSimulados,
    estadisticas: estadisticasSimuladas
  };
};

// Función para simular delay de API
export const simularCargaAPI = async <T>(data: T, delay: number = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Funciones helper para filtros
export const filtrarPorFecha = <T extends { fecha: string }>(
  items: T[], 
  fechaInicio?: string, 
  fechaFin?: string
): T[] => {
  if (!fechaInicio && !fechaFin) return items;
  
  return items.filter(item => {
    const fechaItem = new Date(item.fecha);
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date('1900-01-01');
    const fin = fechaFin ? new Date(fechaFin) : new Date('2100-12-31');
    
    return fechaItem >= inicio && fechaItem <= fin;
  });
};

export const filtrarPorCategoria = (
  items: HistorialItem[], 
  categoria: string
): HistorialItem[] => {
  if (categoria === 'Todos') return items;
  return items.filter(item => item.tipo === categoria);
};