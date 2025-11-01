'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FiBarChart, FiUsers, FiAlertTriangle, FiDownload, FiRefreshCw, FiCalendar, FiActivity, FiDollarSign } from 'react-icons/fi';

interface AnalyticsData {
  totalStats: {
    users: {
      total: number;
      active: number;
      newInPeriod: number;
      byRole: Record<string, number>;
      byMembershipType: Record<string, number>;
    };
    events: {
      total: number;
      upcoming: number;
      past: number;
      newInPeriod: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
    };
    products: {
      total: number;
      inStock: number;
      outOfStock: number;
      newInPeriod: number;
      byCategory: Record<string, number>;
      averagePrice: number;
      totalValue: number;
    };
    memberships: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      newInPeriod: number;
      byType: Record<string, number>;
      approvalRate: number;
    };
    emergencies: {
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
      cancelled: number;
      newInPeriod: number;
      byPriority: Record<string, number>;
      byType: Record<string, number>;
      averageResponseTime: number;
      resolutionRate: number;
    };
  };
  trends: {
    users: Array<{ date: string; count: number }>;
    events: Array<{ date: string; count: number }>;
    memberships: Array<{ date: string; count: number }>;
    emergencies: Array<{ date: string; count: number }>;
  };
  performance: {
    systemHealth: number;
    alerts: Array<{
      type: string;
      message: string;
      action: string;
    }>;
    growthMetrics: {
      userGrowth: number;
      eventGrowth: number;
      membershipGrowth: number;
    };
    topMetrics: {
      mostActiveUsers: Array<Record<string, unknown>>;
      popularEvents: Array<Record<string, unknown>>;
      topProducts: Array<Record<string, unknown>>;
      urgentEmergencies: number;
    };
  };
  period: {
    days: number;
    from: string;
    to: string;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedPeriod = period) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        setError('Error al cargar analytics');
        return;
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setLoading(true);
    fetchAnalytics(newPeriod);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/reports?type=${type}&period=${period}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        alert('Error al generar reporte');
        return;
      }

      const result = await response.json();
      
      // Crear y descargar archivo JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar analytics
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAnalytics();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Cargando datos...</span>
        </div>
      </div>
    );
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 dark:text-green-400';
    if (health >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiBarChart className="mr-3 text-blue-600 dark:text-blue-400" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Análisis completo de datos y métricas del sistema BSK
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Período */}
              <div className="flex items-center space-x-2">
                <FiCalendar className="text-gray-500 dark:text-gray-400" />
                <select
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="365">Último año</option>
                </select>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>

                <button
                  onClick={() => exportReport('summary')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiDownload className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {data.performance.alerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiAlertTriangle className="mr-2 text-yellow-500" />
              Alertas del Sistema
            </h2>
            <div className="space-y-2">
              {data.performance.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : alert.type === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{alert.message}</span>
                    <span className="text-sm opacity-75">{alert.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Usuarios */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.totalStats.users.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  +{data.totalStats.users.newInPeriod} nuevos
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-sm font-medium ${getGrowthColor(data.performance.growthMetrics.userGrowth)}`}>
                {data.performance.growthMetrics.userGrowth > 0 ? '↗' : data.performance.growthMetrics.userGrowth < 0 ? '↘' : '→'} 
                {Math.abs(data.performance.growthMetrics.userGrowth)}% vs período anterior
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eventos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.totalStats.events.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.totalStats.events.upcoming} próximos
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <FiCalendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-sm font-medium ${getGrowthColor(data.performance.growthMetrics.eventGrowth)}`}>
                {data.performance.growthMetrics.eventGrowth > 0 ? '↗' : data.performance.growthMetrics.eventGrowth < 0 ? '↘' : '→'} 
                {Math.abs(data.performance.growthMetrics.eventGrowth)}% vs período anterior
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.totalStats.products.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.totalStats.products.inStock} en stock
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FiDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valor total: €{data.totalStats.products.totalValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Salud del Sistema */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salud del Sistema</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.performance.systemHealth)}`}>
                  {data.performance.systemHealth}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.performance.topMetrics.urgentEmergencies} emergencias críticas
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <FiActivity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos de tendencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia de Usuarios */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendencia de Usuarios (Últimos 7 días)
            </h3>
            <div className="space-y-2">
              {data.trends.users.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-200 dark:bg-blue-700 h-2 rounded"
                      style={{ width: `${Math.max(item.count * 20, 4)}px` }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas de Emergencias */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Emergencias por Prioridad
            </h3>
            <div className="space-y-3">
              {Object.entries(data.totalStats.emergencies.byPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className={`text-sm font-medium capitalize ${
                    priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                    priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {priority === 'critical' ? 'Crítica' :
                     priority === 'high' ? 'Alta' :
                     priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tiempo promedio respuesta:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.totalStats.emergencies.averageResponseTime} min
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Tasa de resolución:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.totalStats.emergencies.resolutionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Membresías */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Estado de Membresías
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {data.totalStats.memberships.pending}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aprobadas</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {data.totalStats.memberships.approved}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rechazadas</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {data.totalStats.memberships.rejected}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de aprobación</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.totalStats.memberships.approvalRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos por categoría */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Productos por Categoría
            </h3>
            <div className="space-y-2">
              {Object.entries(data.totalStats.products.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {category.replace('-', ' ')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Precio promedio:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  €{data.totalStats.products.averagePrice}
                </span>
              </div>
            </div>
          </div>

          {/* Eventos por tipo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Eventos por Tipo
            </h3>
            <div className="space-y-2">
              {Object.entries(data.totalStats.events.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {type.replace('-', ' ')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Próximos:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {data.totalStats.events.upcoming}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reportes Detallados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'users', label: 'Usuarios', icon: FiUsers, color: 'blue' },
              { key: 'events', label: 'Eventos', icon: FiCalendar, color: 'green' },
              { key: 'products', label: 'Productos', icon: FiDollarSign, color: 'purple' },
              { key: 'emergencies', label: 'Emergencias', icon: FiAlertTriangle, color: 'red' }
            ].map((report) => (
              <button
                key={report.key}
                onClick={() => exportReport(report.key)}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 border-dashed transition-colors
                  border-${report.color}-200 dark:border-${report.color}-800 
                  hover:bg-${report.color}-50 dark:hover:bg-${report.color}-900/20
                  text-${report.color}-600 dark:text-${report.color}-400`}
              >
                <report.icon className="h-5 w-5" />
                <span className="font-medium">{report.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}