'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaTrophy, FaChartLine, FaMedal, FaStar, FaSpinner, FaArrowRight } from 'react-icons/fa';
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
}

export default function GamificationPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationStats();
    }
  }, [user]);

  const fetchGamificationStats = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data?.stats);
      } else {
        // Usar datos mock si no hay endpoint
        setStats(mockGamificationData);
      }
    } catch (err) {
      // Usar datos mock en caso de error
      setStats(mockGamificationData);
    } finally {
      setLoading(false);
    }
  };

  const getParticipationPercentage = () => {
    if (!stats || !stats.maxParticipationScore) return 0;
    return Math.round(((stats.participationScore || 0) / stats.maxParticipationScore) * 100);
  };

  const getProgressToNextLevel = () => {
    if (!stats) return 0;
    const currentLevelPoints = (stats.totalPoints || 0) % 1000; // Asumiendo 1000 puntos por nivel
    return Math.round((currentLevelPoints / 1000) * 100);
  };

  const getLevelColor = (level: string) => {
    const levelLower = level?.toLowerCase() || '';
    switch (levelLower) {
      case 'bronce':
        return 'text-orange-600 dark:text-orange-400';
      case 'plata':
        return 'text-gray-500 dark:text-gray-400';
      case 'oro':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'platino':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getLevelIcon = (level: string) => {
    const levelLower = level?.toLowerCase() || '';
    switch (levelLower) {
      case 'bronce':
        return '🥉';
      case 'plata':
        return '🥈';
      case 'oro':
        return '🥇';
      case 'platino':
        return '💎';
      default:
        return '⭐';
    }
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

  if (!stats) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
            Panel de Estadísticas
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-slate-400">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
          Panel de Estadísticas
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Nivel y Puntos */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl mr-2">{getLevelIcon(stats.level || 'Principiante')}</span>
            <div>
              <h4 className={`text-lg font-bold ${getLevelColor(stats.level || 'Principiante')}`}>
                Nivel {stats.level || 'Principiante'}
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
              <span>{getProgressToNextLevel()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressToNextLevel()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
              {(stats.nextLevelPoints || 3000) - ((stats.totalPoints || 0) % 1000)} puntos para el siguiente nivel
            </p>
          </div>
        </div>

        {/* Barra de Participación */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FaChartLine className="mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Participación
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {getParticipationPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getParticipationPercentage()}%` }}
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
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
              #{stats.userRank || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              de {stats.totalUsers || 0}
            </p>
          </div>
        </div>

        {/* Logros recientes */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Logros Recientes
          </h5>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="mr-2">🏆</span>
              <span className="text-gray-600 dark:text-slate-400">
                Participaste en 5 eventos este mes
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="mr-2">⭐</span>
              <span className="text-gray-600 dark:text-slate-400">
                Alcanzaste el nivel {stats.level || 'Principiante'}
              </span>
            </div>
          </div>
        </div>

        {/* Botón para ir a la página completa de puntos */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <Link 
            href="/dashboard/puntos"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FaTrophy className="w-4 h-4" />
            <span>Ver Sistema Completo de Puntos</span>
            <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Mock data para demostración
const mockGamificationData: StatsData = {
  participationScore: 750,
  maxParticipationScore: 1000,
  totalPoints: 2350,
  userRank: 15,
  totalUsers: 245,
  level: 'Plata',
  nextLevelPoints: 3000,
  eventsAttended: 12,
  eventsRegistered: 18
};