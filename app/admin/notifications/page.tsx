'use client';

import { useState, useEffect, type FormEvent } from 'react';

import { getCSRFToken } from '@/lib/csrf-client';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaBell, 
  FaSpinner, 
  FaPlus, 
  FaSync,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaBullhorn,
  FaCheck,
  FaTimes,
  FaEye
} from 'react-icons/fa';

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    event_upcoming: number;
    event_registration_open: number;
    event_reminder: number;
    membership_update: number;
    system_announcement: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  recent: number;
  expired: number;
}

interface NotificationTemplate {
  type: 'event_upcoming' | 'event_registration_open' | 'event_reminder' | 'membership_update' | 'system_announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  targetUsers: 'all' | 'active' | 'premium' | 'specific';
  specificUsers?: string[];
  metadata?: Record<string, unknown>;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'templates' | 'history'>('overview');

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.get('/notifications/admin/stats') as { stats?: typeof stats };
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Generar notificaciones automáticas
  const generateNotifications = async () => {
    try {
      setGenerating(true);
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.post('/notifications/admin/generate', { 
        source: 'admin_manual',
        adminId: user?.id 
      }) as { generated?: number };

      alert(`✅ Generadas ${data.generated || 0} notificaciones automáticas`);
      await loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error generating notifications:', error);
      alert('❌ Error al generar notificaciones');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      void loadStats();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Solo los administradores pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaBell className="mr-3 text-blue-600" />
              Gestión de Notificaciones
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Administra las notificaciones del sistema y crea notificaciones personalizadas
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={generateNotifications}
              disabled={generating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              {generating ? 'Generando...' : 'Generar Automáticas'}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Nueva Notificación
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: FaEye },
              { id: 'create', label: 'Crear', icon: FaPlus },
              { id: 'templates', label: 'Plantillas', icon: FaBullhorn },
              { id: 'history', label: 'Historial', icon: FaCalendarAlt }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'create' | 'templates' | 'history')}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {loadingStats ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <FaBell className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Notificaciones
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unread Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <FaExclamationTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        No Leídas
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.unread.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <FaCalendarAlt className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Últimas 24h
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.recent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expired Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <FaTimes className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Expiradas
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.expired.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Charts Section */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Type */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Por Tipo
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Priority */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Por Prioridad
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${
                            priority === 'urgent' ? 'bg-red-500' :
                            priority === 'high' ? 'bg-orange-500' :
                            priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {priority}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Crear Nueva Notificación
            </h3>
            <CreateNotificationForm onSuccess={() => loadStats()} />
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Plantillas de Notificaciones
            </h3>
            <NotificationTemplates />
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Historial de Notificaciones
            </h3>
            <NotificationHistory />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Componente para crear notificaciones
function CreateNotificationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<NotificationTemplate>({
    type: 'system_announcement',
    priority: 'medium',
    title: '',
    message: '',
    targetUsers: 'all'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post('/notifications/admin/create', formData as unknown as Record<string, unknown>);

      alert('✅ Notificación creada exitosamente');
      setFormData({
        type: 'system_announcement',
        priority: 'medium',
        title: '',
        message: '',
        targetUsers: 'all'
      });
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear la notificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo */}
        <div>
          <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Notificación
          </label>
          <select
            id="notificationType"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'event_upcoming' | 'event_registration_open' | 'event_reminder' | 'membership_update' | 'system_announcement' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="system_announcement">Anuncio del Sistema</option>
            <option value="membership_update">Actualización de Membresía</option>
            <option value="event_upcoming">Evento Próximo</option>
            <option value="event_registration_open">Registro Abierto</option>
            <option value="event_reminder">Recordatorio de Evento</option>
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="notificationPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioridad
          </label>
          <select
            id="notificationPriority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Título de la notificación"
          required
        />
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mensaje
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Contenido de la notificación"
          required
        />
      </div>

      {/* Destinatarios */}
      <div>
        <label htmlFor="targetUsers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Destinatarios
        </label>
        <select
          id="targetUsers"
          value={formData.targetUsers}
          onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value as 'all' | 'active' | 'premium' | 'specific' })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        >
          <option value="all">Todos los usuarios</option>
          <option value="active">Solo usuarios activos</option>
          <option value="premium">Solo miembros premium</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaCheck className="mr-2" />
          )}
          {loading ? 'Creando...' : 'Crear Notificación'}
        </button>
      </div>
    </form>
  );
}

// Componente placeholder para plantillas
function NotificationTemplates() {
  return (
    <div className="text-center py-12">
      <FaBullhorn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Plantillas de Notificaciones
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Las plantillas predefinidas aparecerán aquí próximamente.
      </p>
    </div>
  );
}

// Componente placeholder para historial
function NotificationHistory() {
  return (
    <div className="text-center py-12">
      <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Historial de Notificaciones
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        El historial detallado aparecerá aquí próximamente.
      </p>
    </div>
  );
}
