'use client';

import { useState, useEffect } from 'react';

interface EstadisticasRapidas {
  puntosHoy: number;
  puntosEsteMes: number;
  proximaRecompensa: {
    nombre: string;
    puntosRestantes: number;
  } | null;
  posicionRanking: number;
  cambioRanking: number; // +/- desde la semana pasada
}

interface EstadisticasRapidasProps {
  usuarioId: string;
  puntosActuales: number;
}

export default function EstadisticasRapidas({ usuarioId, puntosActuales }: EstadisticasRapidasProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasRapidas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de estadísticas
    const cargarEstadisticas = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos simulados
      const stats: EstadisticasRapidas = {
        puntosHoy: 25,
        puntosEsteMes: 380,
        proximaRecompensa: {
          nombre: "Camiseta BSK MT",
          puntosRestantes: Math.max(200 - puntosActuales, 0)
        },
        posicionRanking: 5,
        cambioRanking: 2 // Subió 2 posiciones
      };
      
      setEstadisticas(stats);
      setLoading(false);
    };

    cargarEstadisticas();
  }, [usuarioId, puntosActuales]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Estadísticas Rápidas</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const getRankingIcon = (cambio: number) => {
    if (cambio > 0) return '📈';
    if (cambio < 0) return '📉';
    return '➡️';
  };

  const getRankingColor = (cambio: number) => {
    if (cambio > 0) return 'text-green-600';
    if (cambio < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📈 Estadísticas Rápidas
      </h3>
      
      <div className="space-y-4">
        {/* Puntos de hoy */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-blue-700">Puntos ganados hoy</p>
            <p className="text-xl font-bold text-blue-800">
              +{estadisticas.puntosHoy}
            </p>
          </div>
          <div className="text-2xl">🎯</div>
        </div>

        {/* Puntos del mes */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-green-700">Puntos este mes</p>
            <p className="text-xl font-bold text-green-800">
              +{estadisticas.puntosEsteMes}
            </p>
          </div>
          <div className="text-2xl">📅</div>
        </div>

        {/* Próxima recompensa */}
        {estadisticas.proximaRecompensa && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-purple-700">Próxima recompensa</p>
              <p className="text-sm font-medium text-purple-800">
                {estadisticas.proximaRecompensa.nombre}
              </p>
              {estadisticas.proximaRecompensa.puntosRestantes > 0 ? (
                <p className="text-xs text-purple-600">
                  Te faltan {estadisticas.proximaRecompensa.puntosRestantes} puntos
                </p>
              ) : (
                <p className="text-xs text-green-600 font-medium">
                  ¡Ya puedes canjearla!
                </p>
              )}
            </div>
            <div className="text-2xl">🎁</div>
          </div>
        )}

        {/* Posición en ranking */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <p className="text-sm text-yellow-700">Posición en ranking</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-yellow-800">
                #{estadisticas.posicionRanking}
              </p>
              <div className={`flex items-center text-sm ${getRankingColor(estadisticas.cambioRanking)}`}>
                <span className="mr-1">{getRankingIcon(estadisticas.cambioRanking)}</span>
                {estadisticas.cambioRanking !== 0 && (
                  <span>
                    {Math.abs(estadisticas.cambioRanking)} esta semana
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-2xl">🏆</div>
        </div>
      </div>

      {/* Motivación */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center">
        <p className="text-sm font-medium">
          💪 ¡Sigue así! Estás en una buena racha
        </p>
      </div>
    </div>
  );
}