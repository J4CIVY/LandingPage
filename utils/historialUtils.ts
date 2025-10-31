// Utilidades para el sistema de historial del miembro (mantener si hay contexto útil)
import { format, differenceInDays, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { HistorialItem, EstadisticasHistorial } from '@/types/historial';

// Formateo de fechas (mantener si hay contexto útil)
export const formatearFecha = (fecha: string, formato: 'corta' | 'larga' | 'relativa' = 'larga'): string => {
  const fechaObj = parseISO(fecha);
  
  switch (formato) {
    case 'corta':
      return format(fechaObj, 'dd/MM/yyyy', { locale: es });
    case 'larga':
      return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
    case 'relativa': {
      const diasDiferencia = differenceInDays(new Date(), fechaObj);
      if (diasDiferencia === 0) return 'Hoy';
      if (diasDiferencia === 1) return 'Ayer';
      if (diasDiferencia < 7) return `Hace ${diasDiferencia} días`;
      if (diasDiferencia < 30) return `Hace ${Math.floor(diasDiferencia / 7)} semanas`;
      if (diasDiferencia < 365) return `Hace ${Math.floor(diasDiferencia / 30)} meses`;
      return `Hace ${Math.floor(diasDiferencia / 365)} años`;
    }
    default:
      return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
  }
};

// Formateo de moneda colombiana (mantener si hay contexto útil)
export const formatearMoneda = (cantidad: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cantidad);
};

// Calculadora de años de membresía (mantener si hay contexto útil)
export const calcularAñosMembresia = (fechaAfiliacion: string): number => {
  return differenceInYears(new Date(), parseISO(fechaAfiliacion));
};

// Calculadora de días restantes (mantener si hay contexto útil)
export const calcularDiasRestantes = (fechaVencimiento: string): number => {
  return differenceInDays(parseISO(fechaVencimiento), new Date());
};

// Generador de colores para tipos de historial (mantener si hay contexto útil)
export const obtenerColoresTipo = (tipo: string) => {
  const colores = {
    'Evento': {
      icon: 'text-blue-600',
      bg: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-800'
    },
    'Membresía': {
      icon: 'text-green-600',
      bg: 'bg-green-500',
      badge: 'bg-green-100 text-green-800'
    },
    'Beneficio': {
      icon: 'text-yellow-600',
      bg: 'bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    'PQRSDF': {
      icon: 'text-orange-600',
      bg: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-800'
    },
    'Reconocimiento': {
      icon: 'text-purple-600',
      bg: 'bg-purple-500',
      badge: 'bg-purple-100 text-purple-800'
    }
  };
  
  return colores[tipo as keyof typeof colores] || colores['Evento'];
};

// Generador de colores para estados (mantener si hay contexto útil)
export const obtenerColoresEstado = (estado: string) => {
  const colores = {
    'activo': 'bg-green-100 text-green-800',
    'completado': 'bg-blue-100 text-blue-800',
    'cerrado': 'bg-gray-100 text-gray-800',
    'vencido': 'bg-red-100 text-red-800',
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'en_proceso': 'bg-blue-100 text-blue-800',
    'respondido': 'bg-purple-100 text-purple-800',
    'usado': 'bg-green-100 text-green-800',
    'asistio': 'bg-green-100 text-green-800',
    'no_asistio': 'bg-red-100 text-red-800',
    'cancelado': 'bg-gray-100 text-gray-800',
    'inscrito': 'bg-blue-100 text-blue-800'
  };
  
  return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
};

// Calculadora de estadísticas (mantener si hay contexto útil)
export const calcularEstadisticas = (historialItems: HistorialItem[]): EstadisticasHistorial => {
  const eventos = historialItems.filter(item => item.tipo === 'Evento');
  const beneficios = historialItems.filter(item => item.tipo === 'Beneficio');
  const pqrsdf = historialItems.filter(item => item.tipo === 'PQRSDF');
  const logros = historialItems.filter(item => item.tipo === 'Reconocimiento');
  
  // Calcula eventos asistidos
  const eventosAsistidos = eventos.filter(evento => 
    evento.estado === 'completado' || 
    evento.detalles?.estado === 'asistio'
  ).length;

  // Calcula beneficios usados
  const beneficiosUsados = beneficios.filter(beneficio => 
    beneficio.estado === 'completado' || 
    beneficio.detalles?.estado === 'usado'
  ).length;

  // Calcula PQRSDF abiertas
  const pqrsdfAbiertas = pqrsdf.filter(pqr => 
    pqr.estado === 'activo' || 
    pqr.estado === 'pendiente' ||
    pqr.detalles?.estado === 'abierto' ||
    pqr.detalles?.estado === 'en_proceso'
  ).length;

  // Calcula puntos acumulados
  const puntosAcumulados = historialItems.reduce((total, item) => {
    return total + (item.detalles?.puntos || 0);
  }, 0);

  return {
    totalEventos: eventos.length,
    eventosAsistidos,
    beneficiosUsados,
    pqrsdfAbiertas,
    logrosObtenidos: logros.length,
  añosMembresia: 0,
    puntosAcumulados
  };
};

// Generador de timeline items (mantener si hay contexto útil)
export const generarTimelineItems = (historialItems: HistorialItem[]) => {
  return historialItems
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map(item => ({
      ...item,
      fechaFormateada: formatearFecha(item.fecha, 'larga'),
      fechaRelativa: formatearFecha(item.fecha, 'relativa'),
      colores: obtenerColoresTipo(item.tipo),
      estadoColores: obtenerColoresEstado(item.estado || 'completado')
    }));
};

// Filtros avanzados (mantener si hay contexto útil)
export const filtrarHistorial = (
  items: HistorialItem[],
  filtros: {
    categoria?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    busqueda?: string;
  }
) => {
  let itemsFiltrados = [...items];

  // Filtra por categoría
  if (filtros.categoria && filtros.categoria !== 'Todos') {
    itemsFiltrados = itemsFiltrados.filter(item => item.tipo === filtros.categoria);
  }

  // Filtra por fecha
  if (filtros.fechaInicio) {
    itemsFiltrados = itemsFiltrados.filter(item => 
      new Date(item.fecha) >= new Date(filtros.fechaInicio!)
    );
  }

  if (filtros.fechaFin) {
    itemsFiltrados = itemsFiltrados.filter(item => 
      new Date(item.fecha) <= new Date(filtros.fechaFin!)
    );
  }

  // Filtra por estado
  if (filtros.estado && filtros.estado !== 'todos') {
    itemsFiltrados = itemsFiltrados.filter(item => item.estado === filtros.estado);
  }

  // Filtra por búsqueda
  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const busqueda = filtros.busqueda.toLowerCase().trim();
    itemsFiltrados = itemsFiltrados.filter(item =>
      item.descripcion.toLowerCase().includes(busqueda) ||
      item.tipo.toLowerCase().includes(busqueda) ||
      (item.referencia && item.referencia.toLowerCase().includes(busqueda))
    );
  }

  return itemsFiltrados;
};

// Exportador de datos para PDF (mantener si hay contexto útil)
export const prepararDatosParaPDF = (
  historialItems: HistorialItem[],
  estadisticas: EstadisticasHistorial,
  datosUsuario?: { nombre?: string; email?: string; numeroMiembro?: string }
) => {
  const datosPDF = {
    usuario: datosUsuario || { nombre: 'Usuario BSK', email: '', numeroMiembro: '' },
    fechaGeneracion: formatearFecha(new Date().toISOString(), 'larga'),
    estadisticas,
    historial: {
      eventos: historialItems.filter(item => item.tipo === 'Evento'),
      beneficios: historialItems.filter(item => item.tipo === 'Beneficio'),
      pqrsdf: historialItems.filter(item => item.tipo === 'PQRSDF'),
      logros: historialItems.filter(item => item.tipo === 'Reconocimiento'),
      membresia: historialItems.filter(item => item.tipo === 'Membresía')
    },
    resumen: {
      totalItems: historialItems.length,
      periodoInicio: historialItems.length > 0 ? 
        formatearFecha(historialItems[historialItems.length - 1].fecha, 'corta') : '',
      periodoFin: historialItems.length > 0 ? 
        formatearFecha(historialItems[0].fecha, 'corta') : ''
    }
  };

  return datosPDF;
};

// Validador de datos (mantener si hay contexto útil)
export const validarHistorialItem = (item: Partial<HistorialItem>): string[] => {
  const errores: string[] = [];

  if (!item.tipo) errores.push('El tipo es requerido');
  if (!item.fecha) errores.push('La fecha es requerida');
  if (!item.descripcion) errores.push('La descripción es requerida');

  // Valida formato de fecha
  if (item.fecha && isNaN(Date.parse(item.fecha))) {
    errores.push('El formato de fecha no es válido');
  }

  return errores;
};

// Utilidades de ordenamiento (mantener si hay contexto útil)
export const ordenarHistorial = (
  items: HistorialItem[],
  criterio: 'fecha' | 'tipo' | 'estado' = 'fecha',
  direccion: 'asc' | 'desc' = 'desc'
) => {
  return [...items].sort((a, b) => {
    let valorA: any, valorB: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    switch (criterio) {
      case 'fecha':
        valorA = new Date(a.fecha).getTime();
        valorB = new Date(b.fecha).getTime();
        break;
      case 'tipo':
        valorA = a.tipo;
        valorB = b.tipo;
        break;
      case 'estado':
        valorA = a.estado || '';
        valorB = b.estado || '';
        break;
      default:
        valorA = new Date(a.fecha).getTime();
        valorB = new Date(b.fecha).getTime();
    }

    if (direccion === 'asc') {
      return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
    } else {
      return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
    }
  });
};