'use client';

import { useState, useEffect } from 'react';
import { 
  FaFileAlt,
  FaExclamationCircle,
  FaQuestionCircle,
  FaThumbsUp,
  FaLightbulb,
  FaExclamationTriangle,
  FaHeart,
  FaSearch,
  FaFilter,
  FaEye,
  FaReply,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import type { PqrsdfHistorial } from '@/types/historial';

export default function PqrsdfHistorial() {
  const [pqrsdf, setPqrsdf] = useState<PqrsdfHistorial[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'denuncia' | 'felicitacion'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'abierto' | 'en_proceso' | 'cerrado' | 'respondido'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos
    const pqrsdfData: PqrsdfHistorial[] = [
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

    setTimeout(() => {
      setPqrsdf(pqrsdfData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'peticion': return FaFileAlt;
      case 'queja': return FaExclamationCircle;
      case 'reclamo': return FaExclamationTriangle;
      case 'sugerencia': return FaLightbulb;
      case 'denuncia': return FaExclamationTriangle;
      case 'felicitacion': return FaHeart;
      default: return FaQuestionCircle;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'peticion': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'queja': return 'text-red-600 bg-red-50 border-red-200';
      case 'reclamo': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'sugerencia': return 'text-green-600 bg-green-50 border-green-200';
      case 'denuncia': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'felicitacion': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'abierto': return FaClock;
      case 'en_proceso': return FaSpinner;
      case 'cerrado': return FaCheckCircle;
      case 'respondido': return FaReply;
      default: return FaTimesCircle;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto': return 'text-yellow-600 bg-yellow-50';
      case 'en_proceso': return 'text-blue-600 bg-blue-50';
      case 'cerrado': return 'text-green-600 bg-green-50';
      case 'respondido': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'text-red-700 bg-red-100';
      case 'alta': return 'text-orange-700 bg-orange-100';
      case 'media': return 'text-yellow-700 bg-yellow-100';
      case 'baja': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoRespuesta = (fechaCreacion: string, fechaRespuesta?: string) => {
    if (!fechaRespuesta) return null;
    
    const creacion = new Date(fechaCreacion);
    const respuesta = new Date(fechaRespuesta);
    const diferencia = respuesta.getTime() - creacion.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    
    if (horas < 24) {
      return `${horas} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias} día${dias !== 1 ? 's' : ''}`;
    }
  };

  // Filtrar PQRSDF
  const pqrsdfFiltrados = pqrsdf.filter(item => {
    const matchBusqueda = item.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                         item.numeroTicket.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === 'todos' || item.categoria === filtroCategoria;
    const matchEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
    
    return matchBusqueda && matchCategoria && matchEstado;
  });

  const calcularEstadisticas = () => {
    const total = pqrsdf.length;
    const abiertas = pqrsdf.filter(p => p.estado === 'abierto' || p.estado === 'en_proceso').length;
    const cerradas = pqrsdf.filter(p => p.estado === 'cerrado' || p.estado === 'respondido').length;
    const tiempoPromedio = pqrsdf
      .filter(p => p.fechaRespuesta)
      .reduce((acc, p) => {
        const tiempo = calcularTiempoRespuesta(p.fechaCreacion, p.fechaRespuesta);
        if (tiempo?.includes('día')) {
          return acc + parseInt(tiempo);
        }
        return acc;
      }, 0) / pqrsdf.filter(p => p.fechaRespuesta).length;

    return { total, abiertas, cerradas, tiempoPromedio: Math.round(tiempoPromedio) || 0 };
  };

  const stats = calcularEstadisticas();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Historial PQRSDF</h2>
          <p className="text-gray-600">Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones</p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.abiertas}</div>
            <div className="text-xs text-gray-600">Abiertas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.cerradas}</div>
            <div className="text-xs text-gray-600">Cerradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.tiempoPromedio}</div>
            <div className="text-xs text-gray-600">Días promedio</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por asunto o número de ticket..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todas las categorías</option>
          <option value="peticion">Petición</option>
          <option value="queja">Queja</option>
          <option value="reclamo">Reclamo</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="denuncia">Denuncia</option>
          <option value="felicitacion">Felicitación</option>
        </select>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En proceso</option>
          <option value="cerrado">Cerrado</option>
          <option value="respondido">Respondido</option>
        </select>
      </div>

      {/* Lista de PQRSDF */}
      <div className="space-y-4">
        {pqrsdfFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500">No se encontraron solicitudes con los filtros seleccionados.</p>
          </div>
        ) : (
          pqrsdfFiltrados.map((item) => {
            const CategoriaIcon = getCategoriaIcon(item.categoria);
            const EstadoIcon = getEstadoIcon(item.estado);
            const tiempoRespuesta = calcularTiempoRespuesta(item.fechaCreacion, item.fechaRespuesta);
            
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getCategoriaColor(item.categoria)}`}>
                        <CategoriaIcon className="text-lg" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.asunto}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {item.numeroTicket}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(item.categoria)}`}>
                            <CategoriaIcon className="mr-1 text-xs" />
                            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                            <EstadoIcon className={`mr-1 text-xs ${item.estado === 'en_proceso' ? 'animate-spin' : ''}`} />
                            {item.estado === 'en_proceso' ? 'En proceso' : 
                             item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(item.prioridad)}`}>
                            Prioridad {item.prioridad}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-gray-400" />
                            Creado el {formatDate(item.fechaCreacion)}
                          </div>
                          {item.fechaRespuesta && (
                            <div className="flex items-center">
                              <FaReply className="mr-2 text-gray-400" />
                              Respondido el {formatDate(item.fechaRespuesta)}
                              {tiempoRespuesta && (
                                <span className="ml-2 text-green-600">
                                  (Tiempo de respuesta: {tiempoRespuesta})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3 lg:mt-0">
                    <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaEye />
                      <span className="text-sm">Ver detalles</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}