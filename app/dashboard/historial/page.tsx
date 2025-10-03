'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, 
  FaHistory, 
  FaCalendarAlt, 
  FaShoppingCart, 
  FaEnvelope, 
  FaMotorcycle,
  FaArrowLeft,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCreditCard,
  FaTrophy,
  FaStar,
  FaLock,
  FaFileAlt
} from 'react-icons/fa';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  metadata?: any;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function HistorialPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [filterType, setFilterType] = useState<string>('all');

  // Función para obtener el historial del usuario
  const fetchHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      const response = await fetch(`/api/users/activity?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data?.activities || []);
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        throw new Error('No se pudieron cargar las actividades');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchHistorial();
    }
  }, [user, isAuthenticated, pagination.page, filterType]);

  const getActivityIcon = (type: string, status: string) => {
    const baseClasses = "text-2xl";
    const statusColor = status === 'completed' ? 'text-green-500 dark:text-green-400' : 
                       status === 'pending' ? 'text-yellow-500 dark:text-yellow-400' : 
                       status === 'failed' ? 'text-red-500 dark:text-red-400' :
                       'text-gray-500 dark:text-gray-400';
    
    let IconComponent = FaHistory;
    
    switch (type) {
      case 'event_registration':
      case 'event_attendance':
      case 'event_cancellation':
        IconComponent = FaCalendarAlt;
        break;
      case 'store_purchase':
        IconComponent = FaShoppingCart;
        break;
      case 'pqrsdf_sent':
        IconComponent = FaEnvelope;
        break;
      case 'profile_update':
        IconComponent = FaMotorcycle;
        break;
      case 'payment_completed':
      case 'payment_failed':
        IconComponent = FaCreditCard;
        break;
      case 'achievement_earned':
        IconComponent = FaTrophy;
        break;
      case 'points_earned':
        IconComponent = FaStar;
        break;
      case 'password_change':
        IconComponent = FaLock;
        break;
      case 'document_upload':
      case 'membership_update':
        IconComponent = FaFileAlt;
        break;
    }
    
    return <IconComponent className={`${baseClasses} ${statusColor}`} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <FaCheckCircle className="mr-1" />
            Completado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <FaClock className="mr-1" />
            Pendiente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
            <FaTimesCircle className="mr-1" />
            Cancelado
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <FaTimesCircle className="mr-1" />
            Fallido
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-400">Debes iniciar sesión para ver tu historial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
            <FaHistory className="mr-3 text-orange-600 dark:text-orange-400" />
            Historial de Actividades
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Todas tus acciones y eventos en orden cronológico
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
              <FaFilter className="mr-2" />
              Filtrar actividades
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'event_registration', label: 'Eventos' },
              { value: 'payment_completed', label: 'Pagos' },
              { value: 'pqrsdf_sent', label: 'PQRSDF' },
              { value: 'profile_update', label: 'Perfil' },
              { value: 'achievement_earned', label: 'Logros' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setFilterType(filter.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === filter.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de actividades */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <FaSpinner className="animate-spin text-2xl text-orange-600 dark:text-orange-400 mr-3" />
              <span className="text-gray-600 dark:text-slate-400">Cargando actividades...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchHistorial}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <FaHistory className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">
                {filterType === 'all' 
                  ? 'No hay actividades registradas aún'
                  : 'No hay actividades de este tipo'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 dark:text-slate-100">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                              {activity.description}
                            </p>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {activity.metadata.eventName && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                    {activity.metadata.eventName}
                                  </span>
                                )}
                                {activity.metadata.amount && (
                                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                                    ${activity.metadata.amount.toLocaleString('es-CO')} COP
                                  </span>
                                )}
                                {activity.metadata.points && (
                                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                                    +{activity.metadata.points} puntos
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end ml-4">
                            {getStatusBadge(activity.status)}
                            <span className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-slate-300">
                      Mostrando{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}actividades
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}