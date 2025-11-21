'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaHistory, FaCalendarAlt, FaShoppingCart, FaEnvelope, FaMotorcycle, FaSpinner } from 'react-icons/fa';
import apiClient from '@/lib/api-client';

interface Activity {
  id: string;
  type: 'event_registration' | 'event_attendance' | 'store_purchase' | 'pqrsdf_sent' | 'profile_update';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function RecentActivities() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void fetchRecentActivities();
    }
  }, [user]);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // NestJS: GET /users/activity
      const data = await apiClient.get<{ activities: Activity[] }>('/users/activity?limit=5');
      setActivities(data.activities || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setActivities([]);
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    const baseClasses = "text-lg";
    const statusColor = status === 'completed' ? 'text-green-500' : 
                       status === 'pending' ? 'text-yellow-500' : 'text-red-500';
    
    switch (type) {
      case 'event_registration':
      case 'event_attendance':
        return <FaCalendarAlt className={`${baseClasses} ${statusColor}`} />;
      case 'store_purchase':
        return <FaShoppingCart className={`${baseClasses} ${statusColor}`} />;
      case 'pqrsdf_sent':
        return <FaEnvelope className={`${baseClasses} ${statusColor}`} />;
      case 'profile_update':
        return <FaMotorcycle className={`${baseClasses} ${statusColor}`} />;
      default:
        return <FaHistory className={`${baseClasses} ${statusColor}`} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaHistory className="mr-2 text-orange-600 dark:text-orange-400" />
            Actividades Recientes
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-orange-600 dark:text-orange-400" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando actividades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaHistory className="mr-2 text-orange-600 dark:text-orange-400" />
          Actividades Recientes ({activities.length})
        </h3>
      </div>
      
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">No hay actividades recientes</p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              Tu actividad aparecerá aquí cuando realices acciones en la plataforma
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                <div className="shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end ml-4">
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <button
                onClick={() => router.push('/dashboard/historial')}
                className="inline-flex items-center px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
              >
                Ver historial completo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
