'use client';

import { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaFire, 
  FaCalendarCheck, 
  FaUsers,
  FaChartLine,
  FaCrown,
  FaSpinner
} from 'react-icons/fa';

interface Achievement {
  id: string;
  name: string;
  description: string;
  achievedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserRanking {
  position: number;
  totalUsers: number;
}

interface GamificationStats {
  level: number;
  totalPoints: number;
  monthlyPoints: number;
  yearlyPoints: number;
  eventsAttended: number;
  monthlyEvents: number;
  yearlyEvents: number;
  achievements: Achievement[];
  streakDays: number;
  ranking: UserRanking;
  pointsForNextLevel: number;
  recentAchievements: Achievement[];
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  totalPoints: number;
  position: number;
}

export default function GamificationPanel() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'ranking'>('stats');

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener estadísticas del usuario
      const [statsResponse, leaderboardResponse] = await Promise.all([
        fetch('/api/users/gamification', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/leaderboard?limit=5', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        if (leaderboardData.success) {
          setLeaderboard(leaderboardData.data.leaderboard);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getNextLevelPoints = (level: number) => {
    return level * 1000;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return 'text-gray-600';
    if (level < 10) return 'text-orange-600';
    if (level < 15) return 'text-blue-600';
    if (level < 20) return 'text-purple-600';
    return 'text-yellow-600';
  };

  const getLevelIcon = (level: number) => {
    if (level < 5) return '🌱';
    if (level < 10) return '🥉';
    if (level < 15) return '🥈';
    if (level < 20) return '🥇';
    return '💎';
  };

  const getProgressToNextLevel = () => {
    if (!stats) return 0;
    const nextLevelPoints = getNextLevelPoints(stats.level + 1);
    const currentLevelPoints = getNextLevelPoints(stats.level);
    const progressPoints = stats.totalPoints - currentLevelPoints;
    const neededPoints = nextLevelPoints - currentLevelPoints;
    return Math.round((progressPoints / neededPoints) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
            Panel de Gamificación
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-yellow-600 dark:text-yellow-400" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
            Panel de Gamificación
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-slate-400">
            {error || 'No se pudieron cargar las estadísticas'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaTrophy className="mr-2 text-yellow-600 dark:text-yellow-400" />
          Panel de Gamificación
        </h3>
        
        {/* Tabs */}
        <div className="mt-4 flex space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {[
            { id: 'stats', label: 'Estadísticas', icon: FaChartLine },
            { id: 'achievements', label: 'Logros', icon: FaMedal },
            { id: 'ranking', label: 'Ranking', icon: FaTrophy }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {/* Tab: Estadísticas */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Nivel y Puntos */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">{getLevelIcon(stats.level)}</span>
                <div>
                  <h4 className={`text-xl font-bold ${getLevelColor(stats.level)}`}>
                    Nivel {stats.level}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {stats.totalPoints.toLocaleString()} puntos totales
                  </p>
                </div>
              </div>
              
              {/* Progreso al siguiente nivel */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400 mb-2">
                  <span>Progreso al siguiente nivel</span>
                  <span>{getProgressToNextLevel()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressToNextLevel()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  {stats.pointsForNextLevel} puntos para el siguiente nivel
                </p>
              </div>
            </div>

            {/* Grid de estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.eventsAttended}
                    </p>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      Eventos asistidos
                    </p>
                  </div>
                  <FaCalendarCheck className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.streakDays}
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      Días seguidos
                    </p>
                  </div>
                  <FaFire className="text-2xl text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      #{stats.ranking.position}
                    </p>
                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                      Posición global
                    </p>
                  </div>
                  <FaTrophy className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.achievements.length}
                    </p>
                    <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                      Logros obtenidos
                    </p>
                  </div>
                  <FaMedal className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Estadísticas mensuales y anuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">
                  Estadísticas del mes
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Puntos:</span>
                    <span className="font-medium">{stats.monthlyPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Eventos:</span>
                    <span className="font-medium">{stats.monthlyEvents}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">
                  Estadísticas del año
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Puntos:</span>
                    <span className="font-medium">{stats.yearlyPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Eventos:</span>
                    <span className="font-medium">{stats.yearlyEvents}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Logros */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Logros recientes
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Tus últimos {stats.recentAchievements.length} logros obtenidos
              </p>
            </div>
            
            {stats.recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-l-4 ${getRarityBg(achievement.rarity)} border-l-gray-400`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className={`font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                          Obtenido: {new Date(achievement.achievedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <FaStar className={`w-5 h-5 ${getRarityColor(achievement.rarity)}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaMedal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-slate-400">
                  Aún no has obtenido logros
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-500">
                  ¡Participa en eventos para comenzar a ganar logros!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Ranking */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Tu posición en el ranking
              </h4>
              <div className="mt-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FaTrophy className="text-3xl text-yellow-600 dark:text-yellow-400 mr-3" />
                  <div>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      #{stats.ranking.position}
                    </p>
                    <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                      de {stats.ranking.totalUsers} miembros
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-4">
                Top 5 del ranking
              </h5>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' :
                        index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20' :
                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' :
                        'bg-gray-50 dark:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                          {entry.position}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-slate-100">
                            {entry.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            Nivel {entry.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {entry.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          puntos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-slate-400">
                    No se pudo cargar el ranking
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}