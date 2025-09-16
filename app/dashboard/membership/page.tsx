'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import MembershipHeader from '@/components/dashboard/Membership/MembershipHeader';
import MembershipCurrentStatus from '@/components/dashboard/Membership/MembershipCurrentStatus';
import MembershipBenefits from '@/components/dashboard/Membership/MembershipBenefits';
import MembershipHistory from '@/components/dashboard/Membership/MembershipHistory';
import MembershipRenewal from '@/components/dashboard/Membership/MembershipRenewal';
import MembershipAlerts from '@/components/dashboard/Membership/MembershipAlerts';
import MembershipStats from '@/components/dashboard/Membership/MembershipStats';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function MembershipStatusPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { membershipData, loading: membershipLoading, error } = useMembership();

  const isLoading = authLoading || membershipLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Debes iniciar sesión para ver tu información de membresía.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Error al cargar la información de membresía:</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!membershipData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">No se encontró información de membresía.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de Membresía */}
        <MembershipHeader user={user} membershipData={membershipData.membershipData} />

        {/* Alertas importantes */}
        <MembershipAlerts membershipData={membershipData.membershipData} />

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-8">
            {/* Estado actual de la membresía */}
            <MembershipCurrentStatus membershipData={membershipData.membershipData} />

            {/* Beneficios activos */}
            <MembershipBenefits benefits={membershipData.benefits} />

            {/* Historial de membresías */}
            <MembershipHistory history={membershipData.history} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Opciones de renovación */}
            <MembershipRenewal membershipData={membershipData.membershipData} />

            {/* Estadísticas personales */}
            <MembershipStats user={user} membershipData={membershipData.membershipData} />
          </div>
        </div>
      </main>
    </div>
  );
}