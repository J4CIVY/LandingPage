'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaSpinner,
  FaExclamationTriangle,
  FaEye
} from 'react-icons/fa';

interface Event {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  mainImage: string;
  eventType: string;
  departureLocation?: {
    address: string;
    city: string;
    country: string;
  };
  currentParticipants: number;
  maxParticipants?: number;
}

const DashboardEventsSimple: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/events?upcoming=true&limit=3');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Events data:', data); // Para debugging
      
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.message || 'Error al cargar eventos');
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
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
            {events.map((event) => (
              <div key={event._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Imagen del evento */}
                  <div className="flex-shrink-0">
                    <img
                      src={event.mainImage}
                      alt={event.name}
                      className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/images/default-event.jpg'; // Imagen por defecto
                      }}
                    />
                  </div>
                  
                  {/* Información del evento */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                      {event.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-slate-400 mb-4">
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
                    
                    {/* Botón de ver detalles */}
                    <div className="flex gap-2">
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        <FaEye className="mr-1" />
                        Ver Detalles
                      </button>
                      
                      {user && (
                        <button className="inline-flex items-center px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                          Registrarse
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Ver Todos los Eventos
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEventsSimple;
