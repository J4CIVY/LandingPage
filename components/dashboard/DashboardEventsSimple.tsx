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
  FaEye,
  FaUserPlus,
  FaUserMinus,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaTimesCircle
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
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());

  console.log('🎨 Component Render:', { 
    eventsCount: events.length, 
    loading, 
    error,
    hasUser: !!user 
  });

  // Fetch user registrations and favorites
  const fetchUserEventData = async () => {
    if (!user) {
      console.log('🚫 fetchUserEventData: No user, skipping');
      return;
    }
    
    console.log('🔍 fetchUserEventData: Starting with user:', user.email);
    
    try {
      const [registrationsRes, favoritesRes] = await Promise.all([
        fetch('/api/users/events/registrations', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/users/events/favorites', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('📡 fetchUserEventData: Registrations response:', registrationsRes.status);
      console.log('📡 fetchUserEventData: Favorites response:', favoritesRes.status);

      if (registrationsRes.ok) {
        const regData = await registrationsRes.json();
        console.log('✅ fetchUserEventData: Registration data:', regData);
        setUserRegistrations(regData.data?.registrations || []);
      } else {
        const regError = await registrationsRes.json();
        console.error('❌ fetchUserEventData: Registration error:', regError);
      }

      if (favoritesRes.ok) {
        const favData = await favoritesRes.json();
        console.log('✅ fetchUserEventData: Favorites data:', favData);
        setUserFavorites(favData.data?.favorites || []);
      } else {
        const favError = await favoritesRes.json();
        console.error('❌ fetchUserEventData: Favorites error:', favError);
      }
    } catch (error) {
      console.error('❌ fetchUserEventData: Network error:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      console.log('🔍 Component: Iniciando fetch de eventos REALES');
      setLoading(true);
      setError(null);
      
      // USAR LA API REAL que ya funciona, SIN filtro upcoming que está causando problemas
      let url = '/api/events';
      console.log('🌐 Component: Usando API REAL sin filtros:', url);
      
      let response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('📡 Component: API status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Component: API error:', errorText);
        throw new Error(`API failed! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📋 Component: API Response completa:', data);
      console.log('📋 Component: API data.data:', data.data);
      console.log('📋 Component: API events:', data.data?.events);
      
      if (data.success && data.data && data.data.events) {
        const eventsArray = data.data.events || [];
        console.log('✅ Component: EVENTOS ENCONTRADOS:', eventsArray.length);
        console.log('✅ Component: Primer evento:', eventsArray[0]);
        setEvents(eventsArray);
        console.log('✅ Component: Events state actualizado con:', eventsArray.length, 'eventos');
      } else {
        console.error('❌ Component: No se encontraron eventos en la respuesta:', data);
        setError('No se encontraron eventos en la respuesta de la API');
      }
    } catch (err: any) {
      console.error('❌ Component: Error completo:', err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('🏁 Component: Fetch completed');
    }
  };

  // Handle event registration
  const handleEventRegistration = async (eventId: string, action: 'register' | 'unregister') => {
    if (!user) return;
    
    const isProcessing = processingEvents.has(eventId);
    if (isProcessing) return;

    setProcessingEvents(prev => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: action === 'register' ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (action === 'register') {
          setUserRegistrations(prev => [...prev, eventId]);
          // Update event participant count
          setEvents(prev => prev.map(event => 
            event._id === eventId 
              ? { ...event, currentParticipants: event.currentParticipants + 1 }
              : event
          ));
        } else {
          setUserRegistrations(prev => prev.filter(id => id !== eventId));
          // Update event participant count
          setEvents(prev => prev.map(event => 
            event._id === eventId 
              ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
              : event
          ));
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
      }
    } catch (error) {
      console.error('Error handling registration:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (eventId: string) => {
    if (!user) return;
    
    const isProcessing = processingEvents.has(eventId);
    if (isProcessing) return;

    const isFavorite = userFavorites.includes(eventId);
    setProcessingEvents(prev => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (isFavorite) {
          setUserFavorites(prev => prev.filter(id => id !== eventId));
        } else {
          setUserFavorites(prev => [...prev, eventId]);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    console.log('🚀 Component: useEffect triggered');
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserEventData();
    }
  }, [user]);

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
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                🔍 <strong>Debug Info:</strong><br/>
                - Estado de carga: {loading ? 'Cargando' : 'Completado'}<br/>
                - Eventos encontrados: {events.length}<br/>
                - Error: {error || 'Ninguno'}<br/>
                - Usuario logueado: {user ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isRegistered = userRegistrations.includes(event._id);
              const isFavorite = userFavorites.includes(event._id);
              const isProcessing = processingEvents.has(event._id);
              const isEventFull = Boolean(event.maxParticipants && event.currentParticipants >= event.maxParticipants);
              
              return (
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
                          img.src = '/images/default-event.jpg';
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
                      
                      {/* Estado del registro */}
                      {isRegistered && (
                        <div className="mb-3 flex items-center text-green-600 dark:text-green-400 text-sm">
                          <FaCheckCircle className="mr-2" />
                          Estás registrado en este evento
                        </div>
                      )}
                      
                      {isEventFull && !isRegistered && (
                        <div className="mb-3 flex items-center text-red-600 dark:text-red-400 text-sm">
                          <FaTimesCircle className="mr-2" />
                          Evento lleno
                        </div>
                      )}
                      
                      {/* Botones de acción */}
                      <div className="flex flex-wrap gap-2">
                        {/* Ver detalles */}
                        <button 
                          onClick={() => window.location.href = `/events/${event._id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          <FaEye className="mr-1" />
                          Ver Detalles
                        </button>
                        
                        {user && (
                          <>
                            {/* Botón de registro/cancelación */}
                            {isRegistered ? (
                              <button
                                onClick={() => handleEventRegistration(event._id, 'unregister')}
                                disabled={isProcessing}
                                className="inline-flex items-center px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessing ? (
                                  <FaSpinner className="mr-1 animate-spin" />
                                ) : (
                                  <FaUserMinus className="mr-1" />
                                )}
                                Cancelar Registro
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEventRegistration(event._id, 'register')}
                                disabled={isProcessing || isEventFull}
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessing ? (
                                  <FaSpinner className="mr-1 animate-spin" />
                                ) : (
                                  <FaUserPlus className="mr-1" />
                                )}
                                {isEventFull ? 'Evento Lleno' : 'Registrarse'}
                              </button>
                            )}
                            
                            {/* Botón de favorito */}
                            <button
                              onClick={() => handleFavoriteToggle(event._id)}
                              disabled={isProcessing}
                              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isFavorite
                                  ? 'bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-600'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {isProcessing ? (
                                <FaSpinner className="mr-1 animate-spin" />
                              ) : isFavorite ? (
                                <FaHeart className="mr-1" />
                              ) : (
                                <FaRegHeart className="mr-1" />
                              )}
                              {isFavorite ? 'Favorito' : 'Agregar a Favoritos'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
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
