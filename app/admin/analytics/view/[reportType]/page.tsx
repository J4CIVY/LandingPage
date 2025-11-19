'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { FiDownload, FiCalendar, FiBarChart, FiArrowLeft, FiRefreshCw, FiFilter } from 'react-icons/fi';

interface ReportData {
  reportType: string;
  period: {
    from: string;
    to: string;
    days: number;
  };
  generatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  format: string;
}

export default function ViewAnalyticsReportPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const reportType = params.reportType as string;
  
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reportLabels: Record<string, string> = {
    summary: 'Resumen General',
    users: 'Reporte de Usuarios',
    events: 'Reporte de Eventos',
    products: 'Reporte de Productos',
    memberships: 'Reporte de Membresías',
    emergencies: 'Reporte de Emergencias',
    financial: 'Reporte Financiero',
    activity: 'Reporte de Actividad',
    performance: 'Reporte de Rendimiento'
  };

  const fetchReport = async (customStartDate?: string, customEndDate?: string) => {
    try {
      setRefreshing(true);
      const { apiClient } = await import('@/lib/api-client');
      const queryParams: Record<string, string> = { type: reportType };
      
      if (customStartDate) queryParams.startDate = customStartDate;
      if (customEndDate) queryParams.endDate = customEndDate;

      const response = await apiClient.get<{ data: any }>('/analytics/reports', { params: queryParams });
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && reportType) {
      void fetchReport();
    }
  }, [user, reportType]);

  const handleDateFilter = () => {
    if (startDate && endDate) {
      setLoading(true);
      void fetchReport(startDate, endDate);
    }
  };

  const downloadReport = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Cargando reporte...</span>
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
              Error al cargar el reporte
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                void fetchReport();
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
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontró el reporte
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FiBarChart className="mr-3 text-blue-600 dark:text-blue-400" />
                  {reportLabels[reportType] || 'Reporte de Analytics'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Generado el {new Date(data.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => fetchReport()}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>

              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiDownload className="h-4 w-4" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiFilter className="mr-2" />
            Filtros de Fecha
          </h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-end">
            <div className="flex-1">
              <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio
              </label>
              <input
                id="filter-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de fin
              </label>
              <input
                id="filter-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={handleDateFilter}
              disabled={!startDate || !endDate}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <FiCalendar className="h-4 w-4" />
              <span>Aplicar</span>
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Período actual:</strong> {' '}
              {new Date(data.period.from).toLocaleDateString()} - {' '}
              {new Date(data.period.to).toLocaleDateString()} ({data.period.days} días)
            </p>
          </div>
        </div>

        {/* Contenido del reporte */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {renderReportContent(reportType, data.data)}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderReportContent(reportType: string, reportData: any) {
  switch (reportType) {
    case 'users':
      return renderUsersReport(reportData);
    case 'events':
      return renderEventsReport(reportData);
    case 'products':
      return renderProductsReport(reportData);
    case 'memberships':
      return renderMembershipsReport(reportData);
    case 'emergencies':
      return renderEmergenciesReport(reportData);
    case 'financial':
      return renderFinancialReport(reportData);
    case 'activity':
      return renderActivityReport(reportData);
    case 'performance':
      return renderPerformanceReport(reportData);
    case 'summary':
      return renderSummaryReport(reportData);
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Tipo de reporte no reconocido: {reportType}
          </p>
        </div>
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderUsersReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Nuevos Usuarios</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.newUsers}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Total Usuarios</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.totalUsers}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Activos</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.activeUsers}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Verificados</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.verifiedUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Rol</h3>
          <div className="space-y-2">
            {Object.entries(data.usersByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{role}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Tipo de Membresía</h3>
          <div className="space-y-2">
            {Object.entries(data.usersByMembershipType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.userDetails && data.userDetails.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Últimos Usuarios Registrados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.userDetails?.slice(0, 10).map((user: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEventsReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Nuevos Eventos</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.newEvents}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Total Eventos</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.totalEvents}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Próximos</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.upcomingEvents}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Participantes</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.totalParticipants}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Tipo</h3>
          <div className="space-y-2">
            {Object.entries(data.eventsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{type.replace('-', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Estado</h3>
          <div className="space-y-2">
            {Object.entries(data.eventsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderProductsReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Nuevos Productos</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.newProducts}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">En Stock</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.inStockProducts}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Sin Stock</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.outOfStockProducts}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Valor Total</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">€{data.totalInventoryValue?.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Categoría</h3>
          <div className="space-y-2">
            {Object.entries(data.productsByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{category.replace('-', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rangos de Precio</h3>
          <div className="space-y-2">
            {Object.entries(data.priceRanges || {}).map(([range, count]) => (
              <div key={range} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">€{range}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderMembershipsReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Nuevas Solicitudes</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.newApplications}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.pendingApplications}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Tasa Aprobación</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.approvalRate}%</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Tiempo Procesamiento</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.averageProcessingTime} días</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Estado</h3>
          <div className="space-y-2">
            {Object.entries(data.applicationsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Tipo</h3>
          <div className="space-y-2">
            {Object.entries(data.applicationsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{type.replace('-', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEmergenciesReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Nuevas Emergencias</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.newEmergencies}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Críticas</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.criticalEmergencies}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Tasa Resolución</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.resolutionRate}%</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Tiempo Respuesta</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.averageResponseTime} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Prioridad</h3>
          <div className="space-y-2">
            {Object.entries(data.emergenciesByPriority).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
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
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Estado</h3>
          <div className="space-y-2">
            {Object.entries(data.emergenciesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status.replace('-', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderFinancialReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Valor Inventario</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{data.productInventoryValue?.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Precio Promedio</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">€{data.averageProductPrice}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Costos Emergencias</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">€{data.emergencyCosts?.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Costo Promedio</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">€{data.averageEmergencyCost}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Costos por Tipo de Emergencia</h3>
        <div className="space-y-2">
          {Object.entries(data.costByEmergencyType || {}).map(([type, cost]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 capitalize">{type.replace('-', ' ')}</span>
              <span className="font-medium text-gray-900 dark:text-white">€{(cost as number).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActivityReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Actividad Total</h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.totalActivity}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Tipo de Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(data.activityByType).map(([type, count]) => (
            <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{type}</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{count as number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderPerformanceReport(data: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Salud del Sistema</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.systemHealth}%</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Resolución Emergencias</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.efficiencyMetrics?.emergencyResolutionRate}%</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Aprobación Membresías</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.efficiencyMetrics?.membershipApprovalRate}%</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Métricas de Respuesta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo Respuesta Emergencias</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.responseMetrics?.emergencyResponseTime} min</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Procesamiento Membresías</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.responseMetrics?.membershipProcessingTime} días</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderSummaryReport(data: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Nuevos Usuarios</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.overview?.newUsers}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Nuevos Eventos</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.overview?.newEvents}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Nuevos Productos</h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.overview?.newProducts}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Nuevas Membresías</h4>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.overview?.newMemberships}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-red-900 dark:text-red-100">Nuevas Emergencias</h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.overview?.newEmergencies}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Totales del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.keyMetrics?.totalUsers}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Eventos</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.keyMetrics?.totalEvents}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Productos</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.keyMetrics?.totalProducts}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Membresías</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.keyMetrics?.totalMemberships}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Emergencias</h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.keyMetrics?.totalEmergencies}</p>
          </div>
        </div>
      </div>

      {data.alerts && data.alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertas del Sistema</h3>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.alerts?.map((alert: any, index: number) => (
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
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm opacity-75">Prioridad: {alert.priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
