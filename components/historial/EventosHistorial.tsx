'use client';

import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaCrown, 
  FaHandsHelping,
  FaSearch,
  FaFilter,
  FaEye,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { EventoHistorial } from '@/types/historial';

export default function EventosHistorial() {
  const [eventos, setEventos] = useState<EventoHistorial[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'inscrito' | 'asistio' | 'no_asistio' | 'cancelado'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ruta' | 'social' | 'capacitacion' | 'mantenimiento'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos
    const eventosData: EventoHistorial[] = [
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
      },
      {
        id: '6',
        nombre: 'Ruta a Villa de Leyva',
        fecha: '2024-05-25T07:00:00Z',
        fechaInscripcion: '2024-05-18T11:00:00Z',
        estado: 'cancelado',
        rol: 'participante',
        ubicacion: 'Villa de Leyva, Boyacá',
        tipo: 'ruta',
        puntos: 0
      }
    ];

    setTimeout(() => {
      setEventos(eventosData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'organizador': return FaCrown;
      case 'voluntario': return FaHandsHelping;
      default: return FaUserFriends;
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'organizador': return 'text-yellow-600 bg-yellow-50';
      case 'voluntario': return 'text-green-600 bg-green-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'asistio': return FaCheckCircle;
      case 'no_asistio': return FaTimesCircle;
      case 'cancelado': return FaExclamationCircle;
      default: return FaCalendarAlt;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'asistio': return 'text-green-600 bg-green-50';
      case 'no_asistio': return 'text-red-600 bg-red-50';
      case 'cancelado': return 'text-gray-600 bg-gray-50';
      case 'inscrito': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      ruta: 'Ruta',
      social: 'Social',
      capacitacion: 'Capacitación',
      mantenimiento: 'Mantenimiento'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar eventos
  const eventosFiltrados = eventos.filter(evento => {
    const matchBusqueda = evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         evento.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || evento.estado === filtroEstado;
    const matchTipo = filtroTipo === 'todos' || evento.tipo === filtroTipo;
    
    return matchBusqueda && matchEstado && matchTipo;
  });

  const calcularEstadisticas = () => {
    const total = eventos.length;
    const asistidos = eventos.filter(e => e.estado === 'asistio').length;
    const puntosTotales = eventos.reduce((sum, e) => sum + (e.puntos || 0), 0);
    const organizados = eventos.filter(e => e.rol === 'organizador').length;

    return { total, asistidos, puntosTotales, organizados };
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Historial de Eventos</h2>
          <p className="text-gray-600">Revisa tu participación en eventos del motoclub</p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total eventos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.asistidos}</div>
            <div className="text-xs text-gray-600">Asistidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.organizados}</div>
            <div className="text-xs text-gray-600">Organizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.puntosTotales}</div>
            <div className="text-xs text-gray-600">Puntos</div>
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
            placeholder="Buscar eventos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los estados</option>
          <option value="inscrito">Inscrito</option>
          <option value="asistio">Asistió</option>
          <option value="no_asistio">No asistió</option>
          <option value="cancelado">Cancelado</option>
        </select>

        {/* Filtro por tipo */}
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los tipos</option>
          <option value="ruta">Rutas</option>
          <option value="social">Sociales</option>
          <option value="capacitacion">Capacitación</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-4">
        {eventosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
            <p className="text-gray-500">No se encontraron eventos con los filtros seleccionados.</p>
          </div>
        ) : (
          eventosFiltrados.map((evento) => {
            const RolIcon = getRolIcon(evento.rol);
            const EstadoIcon = getEstadoIcon(evento.estado);
            
            return (
              <div
                key={evento.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{evento.nombre}</h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRolColor(evento.rol)}`}>
                            <RolIcon className="mr-1" />
                            {evento.rol.charAt(0).toUpperCase() + evento.rol.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(evento.estado)}`}>
                            <EstadoIcon className="mr-1" />
                            {evento.estado === 'asistio' ? 'Asistió' : 
                             evento.estado === 'no_asistio' ? 'No asistió' :
                             evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {getTipoLabel(evento.tipo)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(evento.fecha)}
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-gray-400" />
                            {evento.ubicacion}
                          </div>
                          {evento.puntos && evento.puntos > 0 && (
                            <div className="flex items-center">
                              <FaStar className="mr-2 text-yellow-400" />
                              {evento.puntos} puntos obtenidos
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