'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaTrophy, FaChartLine, FaMedal, FaStar, FaSpinner, FaArrowRight, FaFireAlt, FaCalendarCheck, FaSeedling, FaArrowUp, FaArrowDown, FaArrowRight as FaArrowStraight, FaBolt, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

interface StatsData {
  participationScore: number;
  maxParticipationScore: number;
  totalPoints: number;
  userRank: number;
  totalUsers: number;
  level: string;
  nextLevelPoints: number;
  eventsAttended: number;
  eventsRegistered: number;
  pointsToday: number;
  pointsThisMonth: number;
  pointsThisYear: number;
  levelProgress: number;
  currentStreak: number;
  bestStreak: number;
  activeDays: number;
  rankingChange: number;
  achievements: number;
  recentActivity: {
    lastLogin: string;
    interactions: number;
  };
}

interface LevelInfo {
  current: string;
  icon: string;
  color: string;
  points: number;
  nextLevelPoints: number;
  progress: number;
}

interface RankingInfo {
  position: number;
  totalUsers: number;
  percentile: number;
  change: number;
}

interface GamificationData {
  stats: StatsData;
  level: LevelInfo;
  ranking: RankingInfo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextRewards: any[];
  user: {
    id: string;
    name: string;
    membershipType: string;
    joinDate: string;
  };
}

export default function GamificationPanel() {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void fetchGamificationStats();
    }
  }, [user]);

  const fetchGamificationStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGamificationData(data.data);
        } else {
          setError(data.error || 'Error al cargar datos');
          setGamificationData(getBasicData());
        }
      } else {
        setError('Error del servidor');
        setGamificationData(getBasicData());
      }
    } catch (err) {
      console.error('Error fetching gamification stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // En caso de error, usar datos básicos
      setGamificationData(getBasicData());
    } finally {
      setLoading(false);
    }
  };

  // Datos básicos en caso de error
  const getBasicData = (): GamificationData => ({
    stats: {
      participationScore: 0,
      maxParticipationScore: 1000,
      totalPoints: 0,
      userRank: 0,
      totalUsers: 0,
      level: 'Novato',
      nextLevelPoints: 100,
      eventsAttended: 0,
      eventsRegistered: 0,
      pointsToday: 0,
      pointsThisMonth: 0,
      pointsThisYear: 0,
      levelProgress: 0,
      currentStreak: 0,
      bestStreak: 0,
      activeDays: 0,
      rankingChange: 0,
      achievements: 0,
      recentActivity: {
        lastLogin: new Date().toISOString(),
        interactions: 0
      }
    },
    level: {
      current: 'Novato',
      icon: '🌱',
      color: '#10B981',
      points: 0,
      nextLevelPoints: 100,
      progress: 0
    },
    ranking: {
      position: 0,
      totalUsers: 0,
      percentile: 0,
      change: 0
    },
    nextRewards: [],
    user: {
      id: user?.id || '',
      name: user ? `${user.firstName} ${user.lastName}` : '',
      membershipType: user?.membershipType || 'friend',
      joinDate: new Date().toISOString()
    }
  });

  const getParticipationPercentage = () => {
    if (!gamificationData?.stats || !gamificationData.stats.maxParticipationScore) return 0;
    return Math.round(((gamificationData.stats.participationScore || 0) / gamificationData.stats.maxParticipationScore) * 100);
  };

  const getLevelIcon = (level: string) => {
    // Usar FaSeedling como icono de Novato, se pueden agregar más niveles si es necesario
    if (level === 'Novato') return <FaSeedling className="text-green-500 dark:text-green-400" />;
    // Otros niveles pueden mapearse a otros íconos si se definen
    return <FaTrophy className="text-yellow-600 dark:text-yellow-400" />;
  }

  const getRankingChangeIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="inline text-green-600 dark:text-green-400" />;
    if (change < 0) return <FaArrowDown className="inline text-red-600 dark:text-red-400" />;
    return <FaArrowStraight className="inline text-gray-600 dark:text-gray-400" />;
  }

  const getRankingChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
            Panel de Estadísticas
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-yellow-600 dark:text-yellow-400" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error && !gamificationData) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
            Panel de Estadísticas
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-slate-400">Error al cargar estadísticas</p>
          <button 
            onClick={fetchGamificationStats}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const stats = gamificationData?.stats;
  const level = gamificationData?.level;
  const ranking = gamificationData?.ranking;

  if (!stats || !level) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
          Panel de Estadísticas
        </h3>
        {error && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Mostrando datos básicos
          </p>
        )}
      </div>
      
      <div className="p-6 space-y-6">
        {/* Nivel y Puntos */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl mr-2">{getLevelIcon(level.current)}</span>
            <div>
              <h4 className="text-lg font-bold text-green-600 dark:text-green-400">
                Nivel {level.current}
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {stats.totalPoints?.toLocaleString() || '0'} puntos totales
              </p>
            </div>
          </div>
          
          {/* Progreso al siguiente nivel */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400 mb-2">
              <span>Progreso al siguiente nivel</span>
              <span>{Math.round(level.progress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-linear-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `clamp(0%, ${level.progress || 0}%, 100%)` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
              {Math.max((level.nextLevelPoints || 100) - (level.points || 0), 0)} puntos para el siguiente nivel
            </p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Puntos de hoy */}
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaFireAlt className="text-blue-600 dark:text-blue-400 mr-1 text-sm" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Hoy
              </span>
            </div>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              +{stats.pointsToday || 0}
            </p>
          </div>

          {/* Puntos del mes */}
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaCalendarCheck className="text-green-600 dark:text-green-400 mr-1 text-sm" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Este mes
              </span>
            </div>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              +{stats.pointsThisMonth || 0}
            </p>
          </div>
        </div>

        {/* Barra de Participación */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FaChartLine className="mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Actividad
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {getParticipationPercentage()}%
            </span>
          </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                className="bg-linear-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `clamp(0%, ${getParticipationPercentage()}%, 100%)` }}
              ></div>
            </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaMedal className="text-green-600 dark:text-green-400 mr-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Eventos
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
              {stats.eventsAttended || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Asistidos
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaStar className="text-purple-600 dark:text-purple-400 mr-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Ranking
              </span>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                #{ranking?.position || 0}
              </p>
              {ranking && ranking.change !== 0 && (
                <span className={`ml-2 text-xs ${getRankingChangeColor(ranking.change)}`}>
                  {getRankingChangeIcon(ranking.change)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              de {ranking?.totalUsers || 0}
            </p>
          </div>
        </div>

        {/* Logros recientes */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Estado Actual
          </h5>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
              <span className="text-gray-600 dark:text-slate-400">
                Nivel {level.current} alcanzado
              </span>
            </div>
            {stats.currentStreak > 0 && (
              <div className="flex items-center text-sm">
                <FaBolt className="mr-2 text-orange-500 dark:text-orange-400" />
                <span className="text-gray-600 dark:text-slate-400">
                  Racha actual: {stats.currentStreak} días
                </span>
              </div>
            )}
            {stats.eventsAttended > 0 && (
              <div className="flex items-center text-sm">
                <FaCheckCircle className="mr-2 text-purple-500 dark:text-purple-400" />
                <span className="text-gray-600 dark:text-slate-400">
                  {stats.eventsAttended} eventos completados
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón para ir a la página completa de puntos */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <Link 
            href="/dashboard/puntos"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 group"
          >
            <FaTrophy className="w-4 h-4" />
            <span>Ver Sistema Completo de Puntos</span>
            <FaArrowRight className="w-3 h-3 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}