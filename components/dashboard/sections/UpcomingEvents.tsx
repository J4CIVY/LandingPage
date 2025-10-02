'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types/events';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaUserPlus,
  FaUserMinus,
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
  const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUpcomingEvents();
    if (user) {
      fetchUserEventData();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/events?upcoming=true&limit=3', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const eventsArray = data.data?.events || data.events || [];
        setEvents(eventsArray);
      } else {
        setError('No se pudieron cargar los eventos');
      }
    } catch (err: any) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventData = async () => {
    if (!user) return;
    
    try {
      const [registrationsRes, favoritesRes] = await Promise.all([
        fetch('/api/users/events/registrations', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/users/events/favorites', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      if (registrationsRes.ok) {
        const regData = await registrationsRes.json();
        setUserRegistrations(regData.data?.registrations || []);
      }

      if (favoritesRes.ok) {
        const favData = await favoritesRes.json();
        setUserFavorites(favData.data?.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching user event data:', error);
    }
  };

  const handleEventRegistration = async (eventId: string, action: 'register' | 'unregister') => {
    if (!user || processingEvents.has(eventId)) return;
    
    setProcessingEvents(prev => new Set(prev).add(eventId));
    
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: action === 'register' ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        if (action === 'register') {
          setUserRegistrations(prev => [...prev, eventId]);
          setEvents(prev => prev.map(event => 
            event._id === eventId 
              ? { ...event, currentParticipants: event.currentParticipants + 1 }
              : event
          ));
        } else {
          setUserRegistrations(prev => prev.filter(id => id !== eventId));
          setEvents(prev => prev.map(event => 
            event._id === eventId 
              ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
              : event
          ));
          alert('Registro cancelado exitosamente');
        }
      } else {
        const errorData = await response.json();
        
        // Si el error es por pago aprobado, redirigir a PQRSDF
        if (action === 'unregister' && errorData.message && errorData.message.includes('pago aprobado')) {
          const confirmar = confirm(
            'Tienes un pago aprobado para este evento. Para cancelar tu inscripción necesitas solicitar un reembolso a través de nuestro sistema PQRSDF.\n\n¿Deseas iniciar la solicitud de reembolso ahora?'
          );
          
          if (confirmar) {
            // Encontrar el evento para obtener sus datos
            const evento = events.find(e => e._id === eventId);
            
            if (evento) {
              // Redirigir al formulario PQRSDF con datos prellenados
              const params = new URLSearchParams({
                categoria: 'peticion',
                subcategoria: 'reembolso',
                eventoId: evento._id,
                eventoNombre: evento.name,
                precio: evento.price?.toString() || '0'
              });
              window.location.href = `/dashboard/pqrsdf/nueva?${params.toString()}`;
            }
          }
        } else {
          alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
        }
      }
    } catch (error) {
      console.error('Error processing event registration:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleToggleFavorite = async (eventId: string) => {
    if (!user || processingEvents.has(eventId)) return;
    
    const isFavorite = userFavorites.includes(eventId);
    const action = isFavorite ? 'remove' : 'add';
    
    setProcessingEvents(prev => new Set(prev).add(eventId));
    
    try {
      const response = await fetch(`/api/users/events/favorites/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        if (action === 'add') {
          setUserFavorites(prev => [...prev, eventId]);
        } else {
          setUserFavorites(prev => prev.filter(id => id !== eventId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
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
              const isProcessing = processingEvents.has(event._id);
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
                        onClick={() => window.location.href = `/events/${event._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <FaEye className="mr-1" />
                        Ver
                      </button>
                      
                      {user && (
                        <>
                          {/* Botón de registro/cancelación */}
                          {isRegistered ? (
                            <button
                              onClick={() => handleEventRegistration(event._id, 'unregister')}
                              disabled={isProcessing}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <FaSpinner className="animate-spin mr-1" />
                              ) : (
                                <FaUserMinus className="mr-1" />
                              )}
                              Cancelar
                            </button>
                          ) : !isEventFull && (
                            <button
                              onClick={() => handleEventRegistration(event._id, 'register')}
                              disabled={isProcessing}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <FaSpinner className="animate-spin mr-1" />
                              ) : (
                                <FaUserPlus className="mr-1" />
                              )}
                              Inscribirse
                            </button>
                          )}
                          
                          {/* Botón de favoritos */}
                          <button
                            onClick={() => handleToggleFavorite(event._id)}
                            disabled={isProcessing}
                            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${
                              isFavorite
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {isProcessing ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : isFavorite ? (
                              <FaHeart className="mr-1" />
                            ) : (
                              <FaRegHeart className="mr-1" />
                            )}
                            {isFavorite ? 'Favorito' : 'Favorito'}
                          </button>
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