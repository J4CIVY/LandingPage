'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MembershipHeader from '@/components/dashboard/Membership/MembershipHeader';
import MembershipCurrentStatus from '@/components/dashboard/Membership/MembershipCurrentStatus';
import MembershipBenefits from '@/components/dashboard/Membership/MembershipBenefits';
import MembershipHistory from '@/components/dashboard/Membership/MembershipHistory';
import MembershipRenewal from '@/components/dashboard/Membership/MembershipRenewal';
import MembershipAlerts from '@/components/dashboard/Membership/MembershipAlerts';
import MembershipStats from '@/components/dashboard/Membership/MembershipStats';
import { FaSpinner } from 'react-icons/fa';

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  category: string;
}

interface MembershipHistoryItem {
  id: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  paymentMethod: string;
}

export default function MembershipStatusPage() {
  const { user, isLoading } = useAuth();
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [history, setHistory] = useState<MembershipHistoryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!user) return;
      
      setIsLoadingData(true);
      try {
        // Simular datos mientras se implementan las APIs
        const mockMembershipData: MembershipData = {
          type: user.membershipType || 'friend',
          startDate: user.joinDate ? new Date(user.joinDate).toISOString() : new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          daysRemaining: 365,
          autoRenewal: false
        };

        const mockBenefits: Benefit[] = [
          {
            id: '1',
            title: 'Descuentos en Eventos',
            description: 'Hasta 20% de descuento en eventos del motoclub',
            icon: 'FaCalendarAlt',
            isActive: true,
            category: 'events'
          },
          {
            id: '2',
            title: 'Soporte Técnico',
            description: 'Asesoría mecánica y técnica especializada',
            icon: 'FaWrench',
            isActive: true,
            category: 'support'
          },
          {
            id: '3',
            title: 'Convenios Comerciales',
            description: 'Descuentos en talleres y tiendas afiliadas',
            icon: 'FaStore',
            isActive: true,
            category: 'commercial'
          }
        ];

        const mockHistory: MembershipHistoryItem[] = [
          {
            id: '1',
            membershipType: 'friend',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active',
            amount: 50000,
            paymentMethod: 'Tarjeta de Crédito'
          }
        ];

        setMembershipData(mockMembershipData);
        setBenefits(mockBenefits);
        setHistory(mockHistory);
      } catch (error) {
        console.error('Error loading membership data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMembershipData();
  }, [user]);

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando información de membresía...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Debes iniciar sesión para ver tu información de membresía.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de Membresía */}
        <MembershipHeader user={user} membershipData={membershipData} />

        {/* Alertas importantes */}
        {membershipData && (
          <MembershipAlerts membershipData={membershipData} />
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-8">
            {/* Estado actual de la membresía */}
            {membershipData && (
              <MembershipCurrentStatus membershipData={membershipData} />
            )}

            {/* Beneficios activos */}
            <MembershipBenefits benefits={benefits} />

            {/* Historial de membresías */}
            <MembershipHistory history={history} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Opciones de renovación */}
            {membershipData && (
              <MembershipRenewal membershipData={membershipData} />
            )}

            {/* Estadísticas personales */}
            <MembershipStats user={user} membershipData={membershipData} />
          </div>
        </div>
      </main>
    </div>
  );
}