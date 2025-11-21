'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  FaSpinner,
  FaArrowLeft,
  FaHistory,
  FaCalendarPlus,
  FaCalendarCheck,
  FaHeart,
  FaUser,
  FaMedal,
  FaCheck,
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle
} from 'react-icons/fa';

interface Activity {
  id: string;
  type: 'event_registration' | 'event_attendance' | 'event_favorite' | 'profile_update' | 'membership_upgrade';
  title: string;
  description: string;
  date: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  details?: Record<string, unknown>;
}

interface Pagination {
  current: number;
  total: number;
  limit: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const iconMap = {
  FaCalendarPlus,
  FaCalendarCheck,
  FaCheck,
  FaHeart,
  FaUser,
  FaMedal,
  FaHistory
};

export default function ActivityPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    limit: 10,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const apiClient = (await import('@/lib/api-client')).default;
      const data = await apiClient.get(`/users/activity?page=${page}&limit=${limit}`) as { 
        activities?: typeof activities; 
        pagination?: typeof pagination 
      };
      
      setActivities(data.activities || []);
      setPagination(data.pagination || { current: 1, total: 1, limit: 10, totalItems: 0, hasNext: false, hasPrev: false });
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      void fetchActivities();
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/activity');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handlePageChange = (newPage: number) => {
    void fetchActivities(newPage, pagination.limit);
  };

  const getActivityIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || FaHistory;
    return IconComponent;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
  };

  const getActivityTypeLabel = (type: string) => {
    const types = {
      'event_registration': 'Registro de Evento',
      'event_attendance': 'Evento Completado',
      'event_favorite': 'Evento Favorito',
      'profile_update': 'Actualización de Perfil',
      'membership_upgrade': 'Membresía'
    };
    return types[type as keyof typeof types] || 'Actividad';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Dashboard
          </button>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center">
                <FaHistory className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Historial de Actividades
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Registro completo de tu actividad en BSK Motorcycle Team
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 appearance-none"
                  aria-label="Filtrar tipo de actividad"
                >
                  <option value="all">Todas las actividades</option>
                  <option value="event_registration">Registros de eventos</option>
                  <option value="event_attendance">Eventos completados</option>
                  <option value="event_favorite">Eventos favoritos</option>
                  <option value="profile_update">Actualizaciones de perfil</option>
                  <option value="membership_upgrade">Membresía</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-slate-400">
              {pagination.totalItems} actividades encontradas
            </div>
          </div>
        </div>

        {/* Lista de Actividades */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-3xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Cargando actividades...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <FaInfoCircle className="text-4xl text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                No se encontraron actividades
              </h3>
              <p className="text-gray-600 dark:text-slate-400">
                {searchTerm || filterType !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no tienes actividades registradas. ¡Comienza participando en eventos!'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.icon);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/70"
                      >
                        <div className={`${activity.bgColor} p-3 rounded-full shrink-0`}>
                          <IconComponent className={`${activity.iconColor} text-lg`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-slate-100">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-xs text-gray-500 dark:text-slate-500">
                                  {getRelativeTime(activity.date)}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-300">
                                  {getActivityTypeLabel(activity.type)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-slate-500 ml-4">
                              {new Date(activity.date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paginación */}
              {pagination.total > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Página {pagination.current} de {pagination.total} 
                      ({pagination.totalItems} actividades total)
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={!pagination.hasPrev}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft className="mr-1" />
                        Anterior
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(Math.min(5, pagination.total))].map((_, index) => {
                          const pageNumber = Math.max(1, pagination.current - 2) + index;
                          if (pageNumber > pagination.total) return null;
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                pageNumber === pagination.current
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={!pagination.hasNext}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                        <FaChevronRight className="ml-1" />
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
