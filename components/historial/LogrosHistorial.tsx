'use client';

import { useState, useEffect } from 'react';
import { 
  FaTrophy,
  FaMedal,
  FaStar,
  FaCrown,
  FaAward,
  FaShieldAlt,
  FaUsers,
  FaRoad,
  FaCalendarAlt,
  FaEye,
  FaDownload,
  FaSearch
} from 'react-icons/fa';
import type { LogroHistorial } from '@/types/historial';

export default function LogrosHistorial() {
  const [logros, setLogros] = useState<LogroHistorial[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'participacion' | 'liderazgo' | 'seguridad' | 'comunidad' | 'especial'>('todos');
  const [filtroNivel, setFiltroNivel] = useState<'todos' | 'bronce' | 'plata' | 'oro' | 'platino'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos
    const logrosData: LogroHistorial[] = [
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

    setTimeout(() => {
      setLogros(logrosData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'participacion': return FaRoad;
      case 'liderazgo': return FaCrown;
      case 'seguridad': return FaShieldAlt;
      case 'comunidad': return FaUsers;
      case 'especial': return FaStar;
      default: return FaTrophy;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'participacion': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'liderazgo': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'seguridad': return 'text-green-600 bg-green-50 border-green-200';
      case 'comunidad': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'especial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'bronce': return FaMedal;
      case 'plata': return FaAward;
      case 'oro': return FaTrophy;
      case 'platino': return FaCrown;
      default: return FaMedal;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'bronce': return 'text-amber-600 bg-amber-50';
      case 'plata': return 'text-gray-600 bg-gray-50';
      case 'oro': return 'text-yellow-600 bg-yellow-50';
      case 'platino': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      participacion: 'Participación',
      liderazgo: 'Liderazgo',
      seguridad: 'Seguridad',
      comunidad: 'Comunidad',
      especial: 'Especial'
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar logros
  const logrosFiltrados = logros.filter(logro => {
    const matchBusqueda = logro.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         logro.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === 'todos' || logro.categoria === filtroCategoria;
    const matchNivel = filtroNivel === 'todos' || logro.nivel === filtroNivel;
    
    return matchBusqueda && matchCategoria && matchNivel;
  });

  const calcularEstadisticas = () => {
    const total = logros.length;
    const puntosTotal = logros.reduce((sum, logro) => sum + logro.puntos, 0);
    const distribucionNiveles = {
      bronce: logros.filter(l => l.nivel === 'bronce').length,
      plata: logros.filter(l => l.nivel === 'plata').length,
      oro: logros.filter(l => l.nivel === 'oro').length,
      platino: logros.filter(l => l.nivel === 'platino').length
    };

    return { total, puntosTotal, distribucionNiveles };
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
  <div className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Logros y Reconocimientos</h2>
          <p className="text-gray-600 dark:text-gray-300">Insignias y reconocimientos obtenidos en tu trayectoria</p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4 lg:mt-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{stats.distribucionNiveles.bronce}</div>
            <div className="text-xs text-gray-600">Bronce</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">{stats.distribucionNiveles.plata}</div>
            <div className="text-xs text-gray-600">Plata</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.distribucionNiveles.oro}</div>
            <div className="text-xs text-gray-600">Oro</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.distribucionNiveles.platino}</div>
            <div className="text-xs text-gray-600">Platino</div>
          </div>
        </div>
      </div>

      {/* Resumen de puntos */}
  <div className="bg-linear-to-r from-purple-600 to-purple-700 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Puntos por Logros</h3>
            <p className="text-purple-100 text-sm">Puntos acumulados por reconocimientos obtenidos</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.puntosTotal}</div>
            <div className="text-purple-100 text-sm">Puntos totales</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar logros..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="todos">Todas las categorías</option>
          <option value="participacion">Participación</option>
          <option value="liderazgo">Liderazgo</option>
          <option value="seguridad">Seguridad</option>
          <option value="comunidad">Comunidad</option>
          <option value="especial">Especial</option>
        </select>

        {/* Filtro por nivel */}
        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="todos">Todos los niveles</option>
          <option value="bronce">Bronce</option>
          <option value="plata">Plata</option>
          <option value="oro">Oro</option>
          <option value="platino">Platino</option>
        </select>
      </div>

      {/* Grid de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logrosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FaTrophy className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay logros</h3>
            <p className="text-gray-500">No se encontraron logros con los filtros seleccionados.</p>
          </div>
        ) : (
          logrosFiltrados.map((logro) => {
            const CategoriaIcon = getCategoriaIcon(logro.categoria);
            const NivelIcon = getNivelIcon(logro.nivel);
            
            return (
              <div
                key={logro.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg bg-linear-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800"
              >
                {/* Header del logro */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getNivelColor(logro.nivel)} border-2 ${logro.nivel === 'oro' ? 'border-yellow-300 dark:border-yellow-400' : logro.nivel === 'platino' ? 'border-purple-300 dark:border-purple-400' : logro.nivel === 'plata' ? 'border-gray-300 dark:border-gray-500' : 'border-amber-300 dark:border-amber-400'}`}>
                    <NivelIcon className="text-2xl" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{logro.puntos}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">puntos</div>
                  </div>
                </div>

                {/* Información del logro */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{logro.nombre}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{logro.descripcion}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoriaColor(logro.categoria)} dark:bg-slate-800 dark:border-slate-700`}>
                      <CategoriaIcon className="mr-1 text-xs" />
                      {getCategoriaLabel(logro.categoria)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(logro.nivel)} dark:bg-slate-800`}>
                      {logro.nivel.charAt(0).toUpperCase() + logro.nivel.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Fecha de obtención */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <FaCalendarAlt className="mr-2 text-gray-400 dark:text-gray-500" />
                      {formatDate(logro.fechaObtencion)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <FaEye className="text-sm" />
                      </button>
                      <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                        <FaDownload className="text-sm" />
                      </button>
                    </div>
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
