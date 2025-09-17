'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
    recent: any;
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

      const response = await fetch('/api/users/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user stats: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data.stats);
      } else {
        throw new Error(result.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user]);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}