'use client';

import { useState, useEffect } from 'react';

import { Event } from '@/types/events';
import apiClient from '@/lib/api-client';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaHeart,
  FaRegHeart,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

export default function UpcomingEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  useEffect(() => {
    void fetchUpcomingEvents();
    if (user) {
      void fetchUserEventData();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // NestJS: GET /events
      const data = await apiClient.get<{ events: Event[] }>('/events?upcoming=true&limit=3');
      const eventsArray = data.events || [];
      setEvents(eventsArray);
    } catch (err: unknown) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventData = async () => {
    if (!user) return;
    
    try {
      // NestJS: GET /users/events/registrations and /users/events/favorites
      const [regData, favData] = await Promise.all([
        apiClient.get<{ registrations: string[] }>('/users/events/registrations'),
        apiClient.get<{ favorites: string[] }>('/users/events/favorites')
      ]);

      setUserRegistrations(regData.registrations || []);
      setUserFavorites(favData.favorites || []);
    } catch (error) {
      console.error('Error fetching user event data:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
            Próximos Eventos
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-gray-600 dark:text-slate-400">Cargando eventos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
            Próximos Eventos
          </h3>
        </div>
        <div className="p-6 text-center">
          <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchUpcomingEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
          Próximos Eventos ({events.length})
        </h3>
      </div>
      
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">No hay eventos próximos</p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              Los eventos aparecerán aquí cuando estén disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isRegistered = userRegistrations.includes(event._id);
              const isFavorite = userFavorites.includes(event._id);
              const isEventFull = Boolean(event.maxParticipants && event.currentParticipants >= event.maxParticipants);
              
              return (
                <div key={event._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        {event.name}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-blue-500" />
                          {new Date(event.startDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        {event.departureLocation && (
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-red-500" />
                            {event.departureLocation.city}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <FaUsers className="mr-2 text-green-500" />
                          {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''} participantes
                        </div>
                      </div>
                      
                      {/* Estado del registro */}
                      {isRegistered && (
                        <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
                          <FaCheckCircle className="mr-2" />
                          Estás registrado en este evento
                        </div>
                      )}
                      
                      {isEventFull && !isRegistered && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-sm">
                          <FaTimesCircle className="mr-2" />
                          Evento lleno
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2">
                      {/* Ver detalles */}
                      <button 
                        onClick={() => window.location.href = `/dashboard/events/${event._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <FaEye className="mr-1" />
                        Ver
                      </button>
                      
                      {user && (
                        <>
                          {/* Indicador de favorito (no cliqueable) */}
                          <div
                            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg ${
                              isFavorite
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                            }`}
                          >
                            {isFavorite ? (
                              <FaHeart className="mr-1" />
                            ) : (
                              <FaRegHeart className="mr-1" />
                            )}
                            {isFavorite ? 'Favorito' : 'Favorito'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-4">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Ver todos los eventos
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
