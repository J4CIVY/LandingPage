'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
    benefits?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    renewalType?: string;
    isLifetime?: boolean;
  } | null;
  // Información adicional calculada (mantener si hay contexto útil)
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

      const response = await fetch('/api/users/membership', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching membership data: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMembershipData(result.data);
      } else {
        throw new Error(result.message || 'Error al obtener datos de membresía');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de membresía');
      console.error('Error fetching membership data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, [isAuthenticated, user]);

  const refreshMembershipData = () => {
    fetchMembershipData();
  };

  return {
    membershipData,
    loading,
    error,
    refreshMembershipData
  };
}