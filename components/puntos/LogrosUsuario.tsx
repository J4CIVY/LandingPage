'use client';

import { useState, useEffect } from 'react';
import { 
  FaMedal, 
  FaTimes, 
  FaCheckCircle, 
  FaBullseye,
  FaExclamationCircle
} from 'react-icons/fa';

interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: 'Actividad' | 'Puntos' | 'Social' | 'Especial';
  desbloqueado: boolean;
  fechaDesbloqueo?: string;
  progreso?: {
    actual: number;
    total: number;
  };
  recompensa?: {
    puntos?: number;
    item?: string;
  };
}

interface EstadisticasLogros {
  total: number;
  desbloqueados: number;
  porcentajeCompletado: number;
  logrosRecientes: Logro[];
  proximosLogros: Logro[];
}

interface LogrosProps {
  usuarioId: string;
  puntosActuales: number;
}

export default function LogrosUsuario({ usuarioId, puntosActuales }: LogrosProps) {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasLogros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<'Todos' | Logro['categoria']>('Todos');

  useEffect(() => {
    const cargarLogros = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/users/achievements');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setLogros(data.logros);
          setEstadisticas(data.estadisticas);
        } else {
          throw new Error(data.error || 'Error cargando logros');
        }
      } catch (error) {
        console.error('Error cargando logros:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        
        // Fallback a datos vacíos en caso de error
        setLogros([]);
        setEstadisticas({
          total: 0,
          desbloqueados: 0,
          porcentajeCompletado: 0,
          logrosRecientes: [],
          proximosLogros: []
        });
      } finally {
        setLoading(false);
      }
    };

    cargarLogros();
  }, [usuarioId]);

  const logrosFiltrados = logros && logros.length > 0 ? logros.filter(logro => 
    filtroCategoria === 'Todos' || logro.categoria === filtroCategoria
  ) : [];

  const logrosDesbloqueados = estadisticas?.desbloqueados || 0;
  const totalLogros = estadisticas?.total || 0;

  const getColorCategoria = (categoria: Logro['categoria']) => {
    const colores = {
      'Actividad': 'bg-blue-100 text-blue-800 border-blue-200',
      'Puntos': 'bg-green-100 text-green-800 border-green-200',
      'Social': 'bg-purple-100 text-purple-800 border-purple-200',
      'Especial': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colores[categoria];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-500" />
          Logros
        </h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-500" />
          Logros
        </h3>
        <div className="text-center py-8">
          <FaTimes className="text-4xl mb-2 text-red-500 mx-auto" />
          <p className="text-red-500 mb-2">Error cargando logros</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaMedal className="text-yellow-500" />
          Logros ({logrosDesbloqueados}/{totalLogros})
        </h3>
        
        {/* Filtros */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as any)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1"
        >
          <option value="Todos">Todos</option>
          <option value="Actividad">Actividad</option>
          <option value="Puntos">Puntos</option>
          <option value="Social">Social</option>
          <option value="Especial">Especial</option>
        </select>
      </div>

      {/* Barra de progreso general */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Progreso general</span>
          <span>{estadisticas?.porcentajeCompletado || 0}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${estadisticas?.porcentajeCompletado || 0}%` }}
          />
        </div>
      </div>

      {/* Lista de logros */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {logrosFiltrados.map((logro) => (
          <div
            key={logro.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              logro.desbloqueado
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icono */}
              <div className={`text-2xl p-2 rounded-full ${
                logro.desbloqueado 
                  ? 'bg-green-100' 
                  : 'bg-gray-200 grayscale'
              }`}>
                {logro.icono}
              </div>

              {/* Información */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    logro.desbloqueado ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {logro.nombre}
                  </h4>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColorCategoria(logro.categoria)}`}>
                    {logro.categoria}
                  </span>

                  {/* Recompensa */}
                  {logro.recompensa?.puntos && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      +{logro.recompensa.puntos} pts
                    </span>
                  )}
                </div>

                <p className={`text-sm ${
                  logro.desbloqueado ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {logro.descripcion}
                </p>

                {/* Fecha de desbloqueo */}
                {logro.desbloqueado && logro.fechaDesbloqueo && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FaCheckCircle />
                    Desbloqueado el {new Date(logro.fechaDesbloqueo).toLocaleDateString('es-ES')}
                  </p>
                )}

                {/* Barra de progreso individual */}
                {!logro.desbloqueado && logro.progreso && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span>{logro.progreso.actual}/{logro.progreso.total}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((logro.progreso.actual / logro.progreso.total) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {logrosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <FaBullseye className="text-4xl mb-2 text-blue-400 mx-auto" />
          <p className="text-gray-500">
            {logros.length === 0 ? 'No hay logros disponibles' : 'No hay logros en esta categoría'}
          </p>
        </div>
      )}
    </div>
  );
}
