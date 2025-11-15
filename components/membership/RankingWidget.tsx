'use client';

import React, { useState, useEffect } from 'react';
import { UserRanking, LeaderboardMember } from '@/types/membership';
import { MEMBERSHIP_CONFIG } from '@/data/membershipConfig';
import { FaTrophy, FaMedal, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

interface RankingWidgetProps {
  userRanking: UserRanking;
  className?: string;
  showLeaderboard?: boolean;
}

export default function RankingWidget({ 
  userRanking, 
  className = '',
  showLeaderboard = true 
}: RankingWidgetProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [realPoints, setRealPoints] = useState<number>(userRanking.points);

  useEffect(() => {
    // Cargar puntos reales del sistema de gamificación
    void fetchRealPoints();
  }, []);

  useEffect(() => {
    if (showLeaderboard) {
      void fetchLeaderboard();
    }
  }, [showLeaderboard]);

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

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/membership/leaderboard?limit=5', {
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

  const getRankingBadge = (position: number) => {
    if (position === 1) return { icon: FaTrophy, color: 'text-yellow-500' };
    if (position === 2) return { icon: FaMedal, color: 'text-gray-400' };
    if (position === 3) return { icon: FaMedal, color: 'text-orange-500' };
    return { icon: null, color: 'text-gray-600' };
  };

  const getPercentile = (position: number, total: number) => {
    return Math.max(1, Math.round(((total - position) / total) * 100));
  };

  return (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
      {/* Ranking personal */}
      <div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tu Ranking</h3>
        
  <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                {(() => {
                  const badge = getRankingBadge(userRanking.position);
                  return badge.icon ? (
                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                  ) : (
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">#{userRanking.position}</span>
                  );
                })()}
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Posición {userRanking.position}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                de {userRanking.totalMembers.toLocaleString()} miembros totales
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {realPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">puntos</p>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>Percentil</span>
              <span>{getPercentile(userRanking.position, userRanking.totalMembers)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
              <div 
                className="absolute left-0 top-0 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-500"
                ref={(el) => {
                  if (el) {
                    el.style.width = `${Math.min(100, Math.max(0, getPercentile(userRanking.position, userRanking.totalMembers)))}%`;
                  }
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Leaderboard */}
      {showLeaderboard && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Top 5 Miembros</h4>
            {loading && <FaSpinner className="animate-spin h-4 w-4 text-blue-500" />}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((member, index) => {
                const badge = getRankingBadge(member.position);
                const memberConfig = MEMBERSHIP_CONFIG[member.membershipType];
                return (
                  <div 
                    key={member.userId} 
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index < 3 
                        ? 'bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900' 
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="shrink-0 w-8 text-center">
                      {badge.icon ? (
                        <badge.icon className={`h-5 w-5 ${badge.color} mx-auto`} />
                      ) : (
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                          #{member.position}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <span 
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                          ref={(el) => {
                            if (el) {
                              el.style.backgroundColor = memberConfig.bgColor;
                              el.style.color = memberConfig.textColor;
                            }
                          }}
                        >
                          {memberConfig.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">pts</p>
                    </div>
                  </div>
                );
              })}
              {leaderboard.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No hay datos de ranking disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* Link para ver ranking completo */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/dashboard/ranking"
              className="block w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Ver ranking completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}