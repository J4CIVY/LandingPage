'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaUsers, 
  FaCalendarAlt,
  FaBoxes,
  FaIdCard,
  FaChartLine,
  FaExclamationTriangle,
  FaMedkit,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaEnvelope
} from 'react-icons/fa';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalProducts: number;
  totalMemberships: number;
  pendingMemberships: number;
  emergencies: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalProducts: 0,
    totalMemberships: 0,
    pendingMemberships: 0,
    emergencies: 0
  });
  
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      void loadStats();
    }
  }, [user]);

  const quickActions = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios registrados',
      href: '/admin/users',
      icon: FaUsers,
      color: 'bg-blue-500',
      stats: `${stats.activeUsers}/${stats.totalUsers}`,
      trend: 'up'
    },
    {
      title: 'Gestión de Eventos',
      description: 'Crear y administrar eventos',
      href: '/admin/events',
      icon: FaCalendarAlt,
      color: 'bg-green-500',
      stats: `${stats.upcomingEvents} próximos`,
      trend: 'up'
    },
    {
      title: 'Gestión de Productos',
      description: 'Inventario y tienda',
      href: '/admin/products',
      icon: FaBoxes,
      color: 'bg-purple-500',
      stats: `${stats.totalProducts} productos`,
      trend: 'stable'
    },
    {
      title: 'Membresías',
      description: 'Gestionar solicitudes de membresía',
      href: '/admin/memberships',
      icon: FaIdCard,
      color: 'bg-orange-500',
      stats: `${stats.pendingMemberships} pendientes`,
      trend: stats.pendingMemberships > 0 ? 'up' : 'stable'
    },
    {
      title: 'Planes de Membresía',
      description: 'Crear y gestionar planes de membresía',
      href: '/admin/membership-plans',
      icon: FaIdCard,
      color: 'bg-blue-600',
      stats: 'Gestionar planes',
      trend: 'stable'
    },
    {
      title: 'Emergencias',
      description: 'Panel de emergencias SOS',
      href: '/admin/emergencies',
      icon: FaMedkit,
      color: stats.emergencies > 0 ? 'bg-red-500' : 'bg-gray-500',
      stats: stats.emergencies > 0 ? `${stats.emergencies} activas` : 'Sin emergencias',
      trend: stats.emergencies > 0 ? 'critical' : 'stable'
    },
    {
      title: 'Reportes y Analytics',
      description: 'Estadísticas y reportes',
      href: '/admin/analytics',
      icon: FaChartLine,
      color: 'bg-indigo-500',
      stats: 'Ver reportes',
      trend: 'up'
    },
    {
      title: 'Gestión de Notificaciones',
      description: 'Administrar notificaciones del sistema',
      href: '/admin/notifications',
      icon: FaBell,
      color: 'bg-yellow-500',
      stats: 'Sistema activo',
      trend: 'stable'
    },
    {
      title: 'Configuración de Email',
      description: 'Configurar sistema de correo Zoho Mail',
      href: '/admin/email-config',
      icon: FaEnvelope,
      color: 'bg-cyan-500',
      stats: 'Zoho Mail API',
      trend: 'stable'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="text-green-500" />;
      case 'down':
        return <FaArrowDown className="text-red-500" />;
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Dashboard de Administración" description="Vista general del sistema BSK Motorcycle Team">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 lg:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Totales</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {loadingStats ? '...' : stats.totalUsers}
              </p>
              <p className="text-xs lg:text-sm text-green-600 dark:text-green-400">
                {loadingStats ? '...' : stats.activeUsers} activos
              </p>
            </div>
            <FaUsers className="text-3xl lg:text-4xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 lg:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Eventos Próximos</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {loadingStats ? '...' : stats.upcomingEvents}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                {loadingStats ? '...' : stats.totalEvents} total
              </p>
            </div>
            <FaCalendarAlt className="text-3xl lg:text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 lg:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Membresías Pendientes</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {loadingStats ? '...' : stats.pendingMemberships}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                {loadingStats ? '...' : stats.totalMemberships} total
              </p>
            </div>
            <FaIdCard className="text-3xl lg:text-4xl text-orange-500" />
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 lg:p-6 border-l-4 ${
          stats.emergencies > 0 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Emergencias</p>
              <p className={`text-2xl lg:text-3xl font-bold ${
                stats.emergencies > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
              }`}>
                {loadingStats ? '...' : stats.emergencies}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              </p>
            </div>
            <FaMedkit className={`text-3xl lg:text-4xl ${
              stats.emergencies > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Alertas Importantes */}
      {stats.emergencies > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-400 mr-3 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  ¡Atención! Hay {stats.emergencies} emergencia(s) activa(s)
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Revisa el panel de emergencias inmediatamente.
                </p>
              </div>
            </div>
            <Link
              href="/admin/emergencies"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-center shrink-0"
            >
              Ver Emergencias
            </Link>
          </div>
        </div>
      )}

      {stats.pendingMemberships > 5 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start">
              <FaIdCard className="text-yellow-400 mr-3 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Muchas solicitudes de membresía pendientes
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Hay {stats.pendingMemberships} solicitudes esperando aprobación.
                </p>
              </div>
            </div>
            <Link
              href="/admin/memberships"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-center shrink-0"
            >
              Revisar Solicitudes
            </Link>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6">Gestión Principal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 p-4 lg:p-6 block group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${action.color} p-2 lg:p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="text-lg lg:text-xl text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(action.trend)}
                  <FaArrowRight className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{action.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.stats}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Ver más →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Resumen de Actividad Reciente */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="h-8 w-8 lg:h-10 lg:w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                <FaUsers className="text-blue-600 dark:text-blue-400 text-sm lg:text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Sistema de administración iniciado
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Panel de control disponible para gestión completa
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Ahora</span>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                La actividad reciente aparecerá aquí una vez que comiences a usar el sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
