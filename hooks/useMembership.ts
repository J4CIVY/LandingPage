'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api-client';

export interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
  membershipNumber?: string;
  membershipInfo?: {
    name: string;
    description: string;
    level: {
      tier: number;
      name: string;
    };
    pricing: {
      initial: number;
      withDiscount?: number;
      early_bird?: number;
      student?: number;
    };
    benefits?: Array<Record<string, unknown>>;
    renewalType?: string;
    isLifetime?: boolean;
  } | null;
  // Información adicional calculada
  daysSinceJoining: number;
  membershipAge: string;
  nextRenewalDate: string;
  canRenew: boolean;
  isNewMember: boolean;
}

export interface MembershipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  category: string;
}

export interface MembershipHistoryItem {
  id: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  paymentMethod: string;
  renewalNumber?: number;
  isAutoRenewal?: boolean;
  description?: string;
}

export interface UserMembershipData {
  membershipData: MembershipData;
  benefits: MembershipBenefit[];
  history: MembershipHistoryItem[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    membershipType: string;
    membershipNumber?: string;
    joinDate: Date;
    isActive: boolean;
  };
}

export function useMembership() {
  const { user, isAuthenticated } = useAuth();
  const [membershipData, setMembershipData] = useState<UserMembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembershipData = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // NestJS: GET /users/me para obtener info del usuario con membresía
      const userData = await apiClient.get<UserMembershipData>('/users/me');
      setMembershipData(userData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de membresía');
      console.error('Error fetching membership data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembershipData();
  }, [isAuthenticated, user]);

  const refreshMembershipData = () => {
    void fetchMembershipData();
  };

  return {
    membershipData,
    loading,
    error,
    refreshMembershipData
  };
}
