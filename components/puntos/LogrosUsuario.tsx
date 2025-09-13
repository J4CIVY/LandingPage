'use client';

import { useState, useEffect } from 'react';

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
}

interface LogrosProps {
  usuarioId: string;
  puntosActuales: number;
}

export default function LogrosUsuario({ usuarioId, puntosActuales }: LogrosProps) {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<'Todos' | Logro['categoria']>('Todos');

  useEffect(() => {
    // Simular carga de logros
    const cargarLogros = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const logrosData: Logro[] = [
        {
          id: '1',
          nombre: 'Primer Paso',
          descripcion: 'Únete al sistema de puntos BSK MT',
          icono: '🎯',
          categoria: 'Actividad',
          desbloqueado: true,
          fechaDesbloqueo: '2024-11-01'
        },
        {
          id: '2',
          nombre: 'Coleccionista',
          descripcion: 'Acumula 500 puntos',
          icono: '💎',
          categoria: 'Puntos',
          desbloqueado: puntosActuales >= 500,
          fechaDesbloqueo: puntosActuales >= 500 ? '2024-11-15' : undefined,
          progreso: {
            actual: Math.min(puntosActuales, 500),
            total: 500
          }
        },
        {
          id: '3',
          nombre: 'Millonario',
          descripcion: 'Acumula 1000 puntos',
          icono: '💰',
          categoria: 'Puntos',
          desbloqueado: puntosActuales >= 1000,
          progreso: {
            actual: Math.min(puntosActuales, 1000),
            total: 1000
          }
        },
        {
          id: '4',
          nombre: 'Comprador Frecuente',
          descripcion: 'Canjea 3 recompensas',
          icono: '🛍️',
          categoria: 'Actividad',
          desbloqueado: false,
          progreso: {
            actual: 1,
            total: 3
          }
        },
        {
          id: '5',
          nombre: 'Piloto Social',
          descripcion: 'Participa en 5 eventos comunitarios',
          icono: '👥',
          categoria: 'Social',
          desbloqueado: false,
          progreso: {
            actual: 2,
            total: 5
          }
        },
        {
          id: '6',
          nombre: 'Miembro Veterano',
          descripcion: 'Mantén tu membresía activa por 6 meses',
          icono: '⭐',
          categoria: 'Especial',
          desbloqueado: true,
          fechaDesbloqueo: '2024-12-01'
        },
        {
          id: '7',
          nombre: 'Líder del Pack',
          descripcion: 'Alcanza el Top 3 del ranking',
          icono: '🏆',
          categoria: 'Social',
          desbloqueado: false,
          progreso: {
            actual: 5,
            total: 3
          }
        },
        {
          id: '8',
          nombre: 'Leyenda BSK',
          descripcion: 'Alcanza el nivel Legend',
          icono: '👑',
          categoria: 'Especial',
          desbloqueado: false,
          progreso: {
            actual: puntosActuales,
            total: 3000
          }
        }
      ];
      
      setLogros(logrosData);
      setLoading(false);
    };

    cargarLogros();
  }, [usuarioId, puntosActuales]);

  const logrosFiltrados = logros.filter(logro => 
    filtroCategoria === 'Todos' || logro.categoria === filtroCategoria
  );

  const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;
  const totalLogros = logros.length;

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
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏅 Logros</h3>
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          🏅 Logros ({logrosDesbloqueados}/{totalLogros})
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
          <span>{Math.round((logrosDesbloqueados / totalLogros) * 100)}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(logrosDesbloqueados / totalLogros) * 100}%` }}
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
                </div>

                <p className={`text-sm ${
                  logro.desbloqueado ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {logro.descripcion}
                </p>

                {/* Fecha de desbloqueo */}
                {logro.desbloqueado && logro.fechaDesbloqueo && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Desbloqueado el {new Date(logro.fechaDesbloqueo).toLocaleDateString('es-ES')}
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
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500">No hay logros en esta categoría</p>
        </div>
      )}
    </div>
  );
}