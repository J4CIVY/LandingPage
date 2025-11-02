'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCSRFToken } from '@/lib/csrf-client';
import { MembershipResponse } from '@/types/membership';
import { getNextMembershipType } from '@/data/membershipConfig';

// Componentes del nuevo sistema de membresías
import MembershipCard from '@/components/membership/MembershipCard';
import MembershipProgress from '@/components/membership/MembershipProgress';
import UpgradeFlowModal from '@/components/membership/UpgradeFlowModal';
import VolunteerToggle from '@/components/membership/VolunteerToggle';
import LeaderApplication from '@/components/membership/LeaderApplication';
import AchievementsList from '@/components/membership/AchievementsList';
import RankingWidget from '@/components/membership/RankingWidget';
import HistoryTable from '@/components/membership/HistoryTable';
import RequirementItem from '@/components/membership/RequirementItem';

import { 
  FaSpinner, 
  FaExclamationTriangle, 
  FaArrowUp, 
  FaCrown,
  FaRedo,
  FaBan,
  FaInfoCircle
} from 'react-icons/fa';

export default function MembershipPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [membershipData, setMembershipData] = useState<MembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  
  // Estados para acciones
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);

  useEffect(() => {
    if (user) {
      void fetchMembershipData();
    }
  }, [user]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/membership', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMembershipData(data.data);
      } else {
        setError(data.message || 'Error al obtener datos de membresía');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de membresía');
      console.error('Error fetching membership data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewal = async () => {
    setRenewalLoading(true);
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/renew', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refrescar datos después de renovación exitosa
        await fetchMembershipData();
        // TODO: Mostrar toast de éxito
      } else {
        // TODO: Mostrar error al usuario
        console.error('Failed to renew membership:', data.message);
      }
    } catch (error) {
      console.error('Error renewing membership:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleCancellation = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu membresía? Esta acción no se puede deshacer.')) {
      return;
    }

    setCancellationLoading(true);
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/cancel', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({
          reason: 'Cancelación solicitada por el usuario'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refrescar datos después de cancelación
        await fetchMembershipData();
        // TODO: Mostrar toast de confirmación
      } else {
        // TODO: Mostrar error al usuario
        console.error('Failed to cancel membership:', data.message);
      }
    } catch (error) {
      console.error('Error cancelling membership:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setCancellationLoading(false);
    }
  };

  const handleRequirementAction = (requirementId: string) => {
    // Navegar a secciones específicas según el requisito
    switch (requirementId) {
      case 'events':
        window.location.href = '/dashboard/eventos';
        break;
      case 'points':
        window.location.href = '/dashboard/puntos';
        break;
      case 'volunteering':
        window.location.href = '/dashboard/eventos'; // TODO: Crear sección específica de voluntariado
        break;
      case 'time':
        // Mostrar información sobre progreso de tiempo
        alert('Este requisito se cumple automáticamente con el tiempo. Mantén tu membresía activa.');
        break;
      default:
        break;
    }
  };

  const isLoading = authLoading || loading;

  // Estados de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Cargando información de membresía...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Debes iniciar sesión para ver tu información de membresía.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">Error al cargar la información de membresía:</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchMembershipData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!membershipData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">No se encontró información de membresía.</p>
          </div>
        </div>
      </div>
    );
  }

  const { membership, ranking, achievements } = membershipData;
  const nextType = getNextMembershipType(membership.type);
  const canUpgrade = membership.progress.percent === 100 && nextType;
  const canApplyLeader = membership.type === 'Master' && membership.volunteer;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Mi Membresía
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Gestiona tu membresía, progreso y beneficios en BSK Motorcycle Team
          </p>
        </div>

        {/* Alertas importantes */}
        {membership.status === 'expired' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">Membresía Expirada</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              Tu membresía ha expirado. Renueva para mantener tus beneficios activos.
            </p>
          </div>
        )}

        {canUpgrade && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">¡Listo para ascender!</span>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-sm"
              >
                Solicitar Ascenso
              </button>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Cumples todos los requisitos para {nextType}. ¡Felicitaciones!
            </p>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tarjeta de membresía actual */}
            <MembershipCard 
              membership={membership}
              showProgress={true}
            />

            {/* Progreso hacia siguiente membresía */}
            {membership.progress.nextType && (
              <MembershipProgress progress={membership.progress} />
            )}

            {/* Requisitos pendientes */}
            {membership.progress.requirements.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Requisitos Pendientes
                </h3>
                <div className="space-y-4">
                  {membership.progress.requirements
                    .filter(req => !req.fulfilled)
                    .map((requirement) => (
                      <RequirementItem 
                        key={requirement.id}
                        requirement={requirement}
                        onActionClick={handleRequirementAction}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Logros */}
            <AchievementsList achievements={achievements} />

            {/* Historial */}
            <HistoryTable history={membership.history} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Acciones de membresía */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Acciones</h3>
              <div className="space-y-3">
                {/* Renovar */}
                <button
                  onClick={handleRenewal}
                  disabled={renewalLoading || membership.status === 'cancelled'}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {renewalLoading ? <FaSpinner className="animate-spin h-4 w-4" /> : <FaRedo className="h-4 w-4" />}
                  <span>Renovar Membresía</span>
                </button>

                {/* Solicitar ascenso */}
                {canUpgrade && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaArrowUp className="h-4 w-4" />
                    <span>Solicitar Ascenso</span>
                  </button>
                )}

                {/* Aplicar a Leader */}
                {canApplyLeader && (
                  <button
                    onClick={() => setShowLeaderModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FaCrown className="h-4 w-4" />
                    <span>Aplicar a Leader</span>
                  </button>
                )}

                {/* Cancelar membresía */}
                <button
                  onClick={handleCancellation}
                  disabled={cancellationLoading || membership.status === 'cancelled'}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancellationLoading ? <FaSpinner className="animate-spin h-4 w-4" /> : <FaBan className="h-4 w-4" />}
                  <span>Cancelar Membresía</span>
                </button>
              </div>
            </div>

            {/* Toggle de voluntario */}
            <VolunteerToggle 
              isVolunteer={membership.volunteer || false}
              userData={{
                fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Usuario',
                email: user?.email || '',
                membershipNumber: user?.membershipNumber || '',
                phone: user?.phone || ''
              }}
              onToggle={() => fetchMembershipData()} // Refrescar datos después del cambio
              className="transition-colors duration-300"
            />

            {/* Ranking */}
            <RankingWidget 
              userRanking={ranking}
              showLeaderboard={true}
              className="transition-colors duration-300"
            />

            {/* Información adicional */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors duration-300">
              <div className="flex items-start space-x-3">
                <FaInfoCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2 transition-colors duration-300">
                    ¿Necesitas ayuda?
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-3 transition-colors duration-300">
                    Si tienes preguntas sobre tu membresía o el proceso de ascenso, contáctanos.
                  </p>
                  <a 
                    href="/contact"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                  >
                    Contactar Soporte →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        {membership && (
          <>
            <UpgradeFlowModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              currentMembership={membership}
              onUpgradeSuccess={() => {
                setShowUpgradeModal(false);
                void fetchMembershipData();
              }}
            />

            <LeaderApplication
              isOpen={showLeaderModal}
              onClose={() => setShowLeaderModal(false)}
              userEligible={canApplyLeader}
              eligibilityErrors={canApplyLeader ? [] : [
                ...(membership.type !== 'Master' ? ['Debes ser Master'] : []),
                ...((!membership.volunteer) ? ['Debes ser Volunteer'] : [])
              ]}
              onApplicationSubmit={() => {
                setShowLeaderModal(false);
                void fetchMembershipData();
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}