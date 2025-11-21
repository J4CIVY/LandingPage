'use client';


import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';

// Importar los nuevos componentes del dashboard
import WelcomeHeader from '@/components/dashboard/sections/WelcomeHeader';
import MembershipStatus from '@/components/dashboard/sections/MembershipStatus';
import UpcomingEvents from '@/components/dashboard/sections/UpcomingEvents';
import ActiveBenefits from '@/components/dashboard/sections/ActiveBenefits';
import RecentActivities from '@/components/dashboard/sections/RecentActivities';
import QuickActions from '@/components/dashboard/sections/QuickActions';
import GamificationPanel from '@/components/dashboard/sections/GamificationPanel';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isInitialized } = useAuth();
  
  // Estados para datos del usuario
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsAttended: 0,
    favoriteEvents: 0,
    daysSinceJoining: 0,
    memberSince: '',
    membershipType: '',
    isActive: true
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.get('/users/me');
      // TODO: Use profile data when implementing user profile display
      console.log('User profile loaded:', data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Función para obtener las estadísticas del usuario
  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.get('/users/stats') as {
        eventsRegistered: number;
        eventsAttended: number;
        favoriteEvents: number;
        daysSinceJoining: number;
        memberSince: string;
        membershipType: string;
        isActive: boolean;
      };
      
      // Formatear fecha de miembro
      const memberSinceDate = new Date(data.memberSince);
      const memberSinceFormatted = memberSinceDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });

      setStats({
        eventsRegistered: data.eventsRegistered,
        eventsAttended: data.eventsAttended,
        favoriteEvents: data.favoriteEvents,
        daysSinceJoining: data.daysSinceJoining,
        memberSince: memberSinceFormatted,
        membershipType: data.membershipType,
        isActive: data.isActive
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      void fetchUserProfile();
      void fetchUserStats();
    }
  }, [isAuthenticated, user]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Acceso Requerido
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-8">
            Debes iniciar sesión para acceder al dashboard
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Encabezado de Bienvenida */}
        <div className="mb-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {user && <WelcomeHeader user={user as any} />}
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Próximos Eventos */}
            <UpcomingEvents />
            
            {/* Beneficios Activos */}
            <ActiveBenefits />
            
            {/* Atajos Rápidos */}
            <QuickActions />
            
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            
            {/* Estado de la Membresía */}
            {!loadingStats && user && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <MembershipStatus user={user as any} stats={stats} />
            )}
            
            {/* Panel de Estadísticas (Gamificación) */}
            <GamificationPanel />
            
            {/* Actividades Recientes */}
            <RecentActivities />
            
          </div>
        </div>

        {/* Footer del Dashboard */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-500">
            ¿Necesitas ayuda? {' '}
            <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
