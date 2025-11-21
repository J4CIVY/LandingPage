'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api-client';

export interface UserStats {
  eventsRegistered: number;
  eventsAttended: number;
  favoriteEvents: number;
  daysSinceJoining: number;
  memberSince: string;
  membershipType: string;
  isActive: boolean;
  totalPoints: number;
  pointsToday: number;
  pointsThisMonth: number;
  pointsThisYear: number;
  currentLevel: string;
  levelIcon: string;
  levelProgress: number;
  nextLevelPoints: number;
  ranking: {
    position: number;
    totalUsers: number;
    percentile: number;
    change: number;
  };
  activity: {
    activeDays: number;
    currentStreak: number;
    bestStreak: number;
    lastConnection: Date;
    totalInteractions: number;
  };
  achievements: {
    total: number;
    recent: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export function useUserStats() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiClient.get<{ success: boolean; data: { stats: UserStats }; message?: string }>('/users/stats');
      
      if (result.success) {
        setStats(result.data.stats);
      } else {
        setError(result.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, [isAuthenticated, user]);

  const refreshStats = () => {
    void fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}
