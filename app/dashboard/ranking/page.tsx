'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LeaderboardMember, UserRanking } from '@/types/membership';
import { MEMBERSHIP_CONFIG } from '@/data/membershipConfig';
import { 
  FaTrophy, 
  FaMedal, 
  FaSpinner, 
  FaChevronLeft,
  FaSearch,
  FaFilter,
  FaCrown,
  FaAward
} from 'react-icons/fa';
import Link from 'next/link';

export default function RankingPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [realPoints, setRealPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembership, setFilterMembership] = useState<string>('all');

  useEffect(() => {
    void fetchFullLeaderboard();
    void fetchUserRanking();
    void fetchRealPoints();
  }, []);

  const fetchRealPoints = async () => {
    try {
      const response = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.stats) {
          setRealPoints(result.data.stats.totalPoints);
        }
      }
    } catch (error) {
      console.error('Error fetching real points:', error);
    }
  };

  const fetchFullLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/membership/leaderboard?limit=100', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRanking = async () => {
    try {
      const response = await fetch('/api/membership', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.data.ranking) {
        setUserRanking(data.data.ranking);
      }
    } catch (error) {
      console.error('Error fetching user ranking:', error);
    }
  };

  const getRankingBadge = (position: number) => {
    if (position === 1) return { icon: FaTrophy, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    if (position === 2) return { icon: FaMedal, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
    if (position === 3) return { icon: FaMedal, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    return { icon: null, color: 'text-gray-600 dark:text-gray-400', bg: '' };
  };

  const filteredLeaderboard = leaderboard.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMembership = filterMembership === 'all' || member.membershipType === filterMembership;
    return matchesSearch && matchesMembership;
  });

  const isCurrentUser = (userId: string) => {
    return user?._id?.toString() === userId;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/membership"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <FaChevronLeft className="mr-2" />
            Volver a Membresía
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaTrophy className="mr-3 text-yellow-500" />
                Ranking de Miembros
              </h1>
              <p className="mt-2 text-gray-600 dark:text-slate-400">
                Los miembros más activos y comprometidos de BSK Motorcycle Team
              </p>
            </div>
          </div>
        </div>

        {/* Tu ranking (destacado) */}
        {userRanking && (
          <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Tu Posición Actual</p>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const badge = getRankingBadge(userRanking.position);
                    return badge.icon ? (
                      <badge.icon className={`h-8 w-8 ${badge.color}`} />
                    ) : (
                      <span className="text-3xl font-bold">#{userRanking.position}</span>
                    );
                  })()}
                  <div>
                    <p className="text-2xl font-bold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-blue-100 text-sm">de {userRanking.totalMembers.toLocaleString()} miembros</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Puntos Totales</p>
                <p className="text-4xl font-bold">{realPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por membresía */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                id="filter-membership-ranking"
                aria-label="Filtrar por tipo de membresía"
                value={filterMembership}
                onChange={(e) => setFilterMembership(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Todas las Membresías</option>
                <option value="Friend">Friend</option>
                <option value="Rider">Rider</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
            <span>Mostrando {filteredLeaderboard.length} de {leaderboard.length} miembros</span>
          </div>
        </div>

        {/* Top 3 - Destacados */}
        {!loading && filteredLeaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {filteredLeaderboard.slice(0, 3).map((member) => {
              const badge = getRankingBadge(member.position);
              const memberConfig = MEMBERSHIP_CONFIG[member.membershipType];
              const isUser = isCurrentUser(member.userId);
              
              return (
                <div
                  key={member.userId}
                  className={`relative ${
                    member.position === 1 ? 'md:col-span-3 md:order-first' : ''
                  }`}
                >
                  <div className={`bg-linear-to-br ${
                    member.position === 1 
                      ? 'from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40' 
                      : member.position === 2
                      ? 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
                      : 'from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40'
                  } rounded-xl p-6 shadow-lg border-2 ${
                    member.position === 1 ? 'border-yellow-400 dark:border-yellow-600' : 'border-transparent'
                  }`}>
                    {isUser && (
                      <div className="absolute top-2 right-2">
                        <FaCrown className="text-yellow-500 text-xl" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md mb-4">
                        {badge.icon && <badge.icon className={`h-8 w-8 ${badge.color}`} />}
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 ${
                        isUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {member.name}
                        {isUser && <span className="text-sm ml-2">(Tú)</span>}
                      </h3>
                      
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3"
                        style={{ 
                          ['--bg-color' as string]: memberConfig.bgColor,
                          ['--text-color' as string]: memberConfig.textColor 
                        } as React.CSSProperties}
                      >
                        <span style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} className="px-3 py-1 rounded-full">
                          {memberConfig.name}
                        </span>
                      </span>
                      
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {member.points.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">puntos</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabla de ranking completo */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaAward className="mr-2 text-purple-600" />
              Ranking Completo
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Cargando ranking...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Miembro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Membresía
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Puntos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredLeaderboard.map((member) => {
                    const badge = getRankingBadge(member.position);
                    const memberConfig = MEMBERSHIP_CONFIG[member.membershipType];
                    const isUser = isCurrentUser(member.userId);
                    
                    return (
                      <tr 
                        key={member.userId}
                        className={`${
                          isUser 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {badge.icon ? (
                              <badge.icon className={`h-5 w-5 ${badge.color}`} />
                            ) : (
                              <span className={`text-sm font-bold ${badge.color}`}>
                                #{member.position}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <p className={`text-sm font-medium ${
                              isUser 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {member.name}
                              {isUser && <span className="ml-2 text-xs">(Tú)</span>}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              ['--bg-color' as string]: memberConfig.bgColor,
                              ['--text-color' as string]: memberConfig.textColor 
                            } as React.CSSProperties}
                          >
                            <span style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} className="px-2.5 py-0.5 rounded-full">
                              {memberConfig.name}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {member.points.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">pts</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLeaderboard.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-slate-400">
                    No se encontraron miembros con esos criterios
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
            ¿Cómo se calculan los puntos?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>50 puntos</strong> por cada mes como miembro activo</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>100 puntos</strong> por cada evento al que asistes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>200 puntos</strong> por cada actividad de voluntariado</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Multiplicador</strong> según tu tipo de membresía (Friend 1.0x, Rider 1.2x, Pro 1.5x)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
