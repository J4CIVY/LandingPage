'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { 
  FaChartLine, 
  FaSync, 
  FaBullseye, 
  FaCalendarAlt, 
  FaFire, 
  FaGift, 
  FaTrophy, 
  FaArrowUp, 
  FaArrowDown, 
  FaArrowRight,
  FaCircle,
  FaExclamationTriangle,
  FaDumbbell,
  FaRocket,
  FaStar
} from 'react-icons/fa';

interface EstadisticasRapidas {
  puntosHoy: number;
  puntosEsteMes: number;
  proximaRecompensa: {
    nombre: string;
    puntosRestantes: number;
  } | null;
  posicionRanking: number;
  cambioRanking: number; // +/- desde la semana pasada
  totalPuntos: number;
  rachaActual: number;
  mejorRacha: number;
}

interface EstadisticasRapidasProps {
  usuarioId: string;
  puntosActuales?: number;
}

export default function EstadisticasRapidas({ usuarioId, puntosActuales = 0 }: EstadisticasRapidasProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasRapidas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void cargarEstadisticas();
  }, [usuarioId]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // NestJS: GET /users/gamification
      const data = await apiClient.get<{ summary: any; ranking: any; nextRewards: any[]; user: any }>('/users/gamification');
      
      if (data.summary) {
        const { summary, ranking, nextRewards } = data;
        
        // Mapear datos reales a la interfaz esperada
        const statsData: EstadisticasRapidas = {
          puntosHoy: summary.pointsToday || 0,
          puntosEsteMes: summary.pointsThisMonth || 0,
          proximaRecompensa: nextRewards.length > 0 ? {
            nombre: nextRewards[0].nombre,
            puntosRestantes: Math.max(nextRewards[0].costoPuntos - summary.totalPoints, 0)
          } : null,
          posicionRanking: ranking.position || 0,
          cambioRanking: ranking.change || 0,
          totalPuntos: summary.totalPoints || 0,
          rachaActual: data.user?.currentStreak || 0,
          mejorRacha: data.user?.bestStreak || 0
        };
        
        setEstadisticas(statsData);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Usar datos vacíos reales en caso de error - NO generar datos falsos
      const fallbackStats: EstadisticasRapidas = {
        puntosHoy: 0,
        puntosEsteMes: 0,
        proximaRecompensa: null,
        posicionRanking: 0,
        cambioRanking: 0,
        totalPuntos: puntosActuales || 0,
        rachaActual: 0,
        mejorRacha: 0
      };
      
      setEstadisticas(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-500 dark:text-blue-400" />
          Estadísticas Rápidas
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const getRankingIcon = (cambio: number) => {
    if (cambio > 0) return <FaArrowUp className="inline" />;
    if (cambio < 0) return <FaArrowDown className="inline" />;
    return <FaArrowRight className="inline" />;
  };

  const getRankingColor = (cambio: number) => {
    if (cambio > 0) return 'text-green-600 dark:text-green-400';
    if (cambio < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getMotivationalMessage = () => {
    const messages = [
      { icon: <FaDumbbell className="inline mr-2" />, text: '¡Sigue así! Estás en una buena racha' },
      { icon: <FaRocket className="inline mr-2" />, text: '¡Vas por buen camino! Sigue participando' },
      { icon: <FaStar className="inline mr-2" />, text: '¡Excelente progreso! Mantén el ritmo' },
      { icon: <FaTrophy className="inline mr-2" />, text: '¡Tu esfuerzo está dando frutos!' },
      { icon: <FaFire className="inline mr-2" />, text: '¡Imparable! Sigue acumulando puntos' }
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <FaChartLine className="text-blue-500 dark:text-blue-400" />
          Estadísticas Rápidas
        </h3>
        {error && (
          <button 
            onClick={cargarEstadisticas}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            title="Actualizar datos"
            type="button"
          >
            <FaSync className="inline text-blue-500 dark:text-blue-400" />
            Actualizar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Puntos de hoy */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Puntos ganados hoy</p>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
              +{estadisticas.puntosHoy}
            </p>
          </div>
          <FaBullseye className="text-2xl text-blue-500 dark:text-blue-400" />
        </div>

        {/* Puntos del mes */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <div>
            <p className="text-sm text-green-700 dark:text-green-300">Puntos este mes</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">
              +{estadisticas.puntosEsteMes}
            </p>
          </div>
          <FaCalendarAlt className="text-2xl text-green-500 dark:text-green-400" />
        </div>

        {/* Racha actual */}
        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
          <div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Racha actual</p>
            <p className="text-xl font-bold text-orange-800 dark:text-orange-200">
              {estadisticas.rachaActual} días
            </p>
            {estadisticas.mejorRacha > estadisticas.rachaActual && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Mejor: {estadisticas.mejorRacha} días
              </p>
            )}
          </div>
          <FaFire className="text-2xl text-orange-500 dark:text-orange-400" />
        </div>

        {/* Próxima recompensa */}
        {estadisticas.proximaRecompensa && (
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-purple-700 dark:text-purple-300">Próxima recompensa</p>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {estadisticas.proximaRecompensa.nombre}
              </p>
              {estadisticas.proximaRecompensa.puntosRestantes > 0 ? (
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Te faltan {estadisticas.proximaRecompensa.puntosRestantes} puntos
                </p>
              ) : (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ¡Ya puedes canjearla!
                </p>
              )}
            </div>
            <FaGift className="text-2xl text-purple-500 dark:text-purple-400" />
          </div>
        )}

        {/* Posición en ranking */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Posición en ranking</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                #{estadisticas.posicionRanking}
              </p>
              {estadisticas.cambioRanking !== 0 && (
                <div className={`flex items-center text-sm ${getRankingColor(estadisticas.cambioRanking)}`}>
                  <span className="mr-1">{getRankingIcon(estadisticas.cambioRanking)}</span>
                  <span>
                    {Math.abs(estadisticas.cambioRanking)} esta semana
                  </span>
                </div>
              )}
            </div>
          </div>
          <FaTrophy className="text-2xl text-yellow-500 dark:text-yellow-400" />
        </div>
      </div>

      {/* Motivación */}
      <div className="mt-4 p-3 bg-linear-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-lg text-white text-center">
        <p className="text-sm font-medium flex items-center justify-center">
          {(() => {
            const message = getMotivationalMessage();
            return (
              <>
                {message.icon}
                {message.text}
              </>
            );
          })()}
        </p>
      </div>

      {/* Indicador de datos en vivo */}
      {!error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <FaCircle className="text-green-500 dark:text-green-400 text-xs" />
            Datos actualizados en tiempo real
          </p>
        </div>
      )}

      {/* Indicador de error */}
      {error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <FaExclamationTriangle className="text-amber-600 dark:text-amber-400" />
            Mostrando datos básicos - {error}
          </p>
        </div>
      )}
    </div>
  );
}
