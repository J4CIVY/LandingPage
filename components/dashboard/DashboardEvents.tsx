'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaMotorcycle,
  FaTrophy,
  FaMoneyBillWave,
  FaInfoCircle
} from 'react-icons/fa';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Event {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate?: string;
  mainImage: string;
  eventType: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  departureLocation?: {
    address: string;
    city: string;
    country: string;
  };
  arrivalLocation?: {
    address: string;
    city: string;
    country: string;
  };
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline?: string;
  price?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  distance?: number;
  duration?: number;
  organizer: {
    name: string;
    phone: string;
    email: string;
  };
  participants?: string[];
  tags?: string[];
  isRegistrationOpen?: boolean;
  isFull?: boolean;
  isPast?: boolean;
}

interface DashboardEventsProps {
  onViewEvent?: (event: Event) => void;
}

const DashboardEvents: React.FC<DashboardEventsProps> = ({ onViewEvent }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    fetchUpcomingEvents();
    if (user) {
      fetchUserEventData();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?upcoming=true&limit=10');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.message || 'Error al cargar eventos');
      }
    } catch (err) {
      setError('Error de conexión al cargar eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventData = async () => {
    if (!user) return;
    
    try {
      // Obtener registros del usuario
      const registrationsResponse = await fetch('/api/users/events/registrations');
      if (registrationsResponse.ok) {
        const regData = await registrationsResponse.json();
        setUserRegistrations(regData.registrations || []);
      }

      // Obtener favoritos del usuario
      const favoritesResponse = await fetch('/api/users/events/favorites');
      if (favoritesResponse.ok) {
        const favData = await favoritesResponse.json();
        setUserFavorites(favData.favorites || []);
      }
    } catch (err) {
      console.error('Error fetching user event data:', err);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!user) return;
    
    setActionLoading(prev => ({ ...prev, [`register_${eventId}`]: true }));
    
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserRegistrations(prev => [...prev, eventId]);
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, currentParticipants: event.currentParticipants + 1 }
            : event
        ));
      } else {
        alert(data.message || 'Error al registrarse en el evento');
      }
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Error de conexión al registrarse');
    } finally {
      setActionLoading(prev => ({ ...prev, [`register_${eventId}`]: false }));
    }
  };

  const handleUnregisterEvent = async (eventId: string) => {
    if (!user) return;
    
    setActionLoading(prev => ({ ...prev, [`unregister_${eventId}`]: true }));
    
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserRegistrations(prev => prev.filter(id => id !== eventId));
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
            : event
        ));
        alert('Registro cancelado exitosamente');
      } else {
        console.error('Unregister error:', data);
        
        // Si el error es por pago aprobado, redirigir a PQRSDF
        const errorMessage = data.message?.toLowerCase() || '';
        const isPaymentError = (
          errorMessage.includes('pago aprobado') ||
          errorMessage.includes('pago') ||
          errorMessage.includes('reembolso') ||
          errorMessage.includes('contacta al soporte')
        );
        
        if (isPaymentError) {
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
          alert(data.message || 'Error al cancelar registro');
        }
      }
    } catch (err) {
      console.error('Error unregistering from event:', err);
      alert('Error de conexión al cancelar registro');
    } finally {
      setActionLoading(prev => ({ ...prev, [`unregister_${eventId}`]: false }));
    }
  };

  const handleToggleFavorite = async (eventId: string) => {
    if (!user) return;
    
    const isFavorite = userFavorites.includes(eventId);
    setActionLoading(prev => ({ ...prev, [`favorite_${eventId}`]: true }));
    
    try {
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (isFavorite) {
          setUserFavorites(prev => prev.filter(id => id !== eventId));
        } else {
          setUserFavorites(prev => [...prev, eventId]);
        }
      } else {
        alert(data.message || 'Error al actualizar favoritos');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Error de conexión al actualizar favoritos');
    } finally {
      setActionLoading(prev => ({ ...prev, [`favorite_${eventId}`]: false }));
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    if (onViewEvent) {
      onViewEvent(event);
    }
  };

  const getEventStatusColor = (event: Event) => {
    if (event.isPast) return 'text-gray-500';
    if (event.status === 'cancelled') return 'text-red-500';
    if (event.isFull) return 'text-orange-500';
    return 'text-green-500';
  };

  const getEventStatusText = (event: Event) => {
    if (event.isPast) return 'Finalizado';
    if (event.status === 'cancelled') return 'Cancelado';
    if (event.isFull) return 'Lleno';
    return 'Disponible';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return difficulty;
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
          <p className="text-red-600 dark:text-red-400">{error}</p>
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
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
            Próximos Eventos
          </h3>
        </div>
        
        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">No hay eventos próximos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => {
                const isRegistered = userRegistrations.includes(event._id);
                const isFavorite = userFavorites.includes(event._id);
                const canRegister = event.isRegistrationOpen && !isRegistered && !event.isFull;
                
                return (
                  <div key={event._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      {/* Imagen del evento */}
                      <div className="flex-shrink-0">
                        <img
                          src={event.mainImage}
                          alt={event.name}
                          className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Información del evento */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
                            {event.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <span className={`text-sm font-medium ${getEventStatusColor(event)}`}>
                              {getEventStatusText(event)}
                            </span>
                            {event.difficulty && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(event.difficulty)}`}>
                                {getDifficultyText(event.difficulty)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-slate-400 mb-4">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-blue-500" />
                            {format(new Date(event.startDate), 'dd MMM yyyy, HH:mm', { locale: es })}
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
                          
                          {event.price !== undefined && (
                            <div className="flex items-center">
                              <FaMoneyBillWave className="mr-2 text-yellow-500" />
                              {event.price === 0 ? 'Gratis' : `$${event.price}`}
                            </div>
                          )}
                          
                          {event.distance && (
                            <div className="flex items-center">
                              <FaMotorcycle className="mr-2 text-purple-500" />
                              {event.distance} km
                            </div>
                          )}
                          
                          {event.duration && (
                            <div className="flex items-center">
                              <FaClock className="mr-2 text-orange-500" />
                              {event.duration}h duración
                            </div>
                          )}
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                          >
                            <FaEye className="mr-1" />
                            Ver Detalles
                          </button>
                          
                          {user && canRegister && (
                            <button
                              onClick={() => handleRegisterEvent(event._id)}
                              disabled={actionLoading[`register_${event._id}`]}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                            >
                              {actionLoading[`register_${event._id}`] ? (
                                <FaSpinner className="animate-spin mr-1" />
                              ) : (
                                <FaUserPlus className="mr-1" />
                              )}
                              Registrarse
                            </button>
                          )}
                          
                          {user && isRegistered && (
                            <button
                              onClick={() => handleUnregisterEvent(event._id)}
                              disabled={actionLoading[`unregister_${event._id}`]}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
                            >
                              {actionLoading[`unregister_${event._id}`] ? (
                                <FaSpinner className="animate-spin mr-1" />
                              ) : (
                                <FaUserMinus className="mr-1" />
                              )}
                              Cancelar
                            </button>
                          )}
                          
                          {user && (
                            <button
                              onClick={() => handleToggleFavorite(event._id)}
                              disabled={actionLoading[`favorite_${event._id}`]}
                              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${
                                isFavorite
                                  ? 'bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-600'
                                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                              }`}
                            >
                              {actionLoading[`favorite_${event._id}`] ? (
                                <FaSpinner className="animate-spin mr-1" />
                              ) : isFavorite ? (
                                <FaHeart className="mr-1" />
                              ) : (
                                <FaRegHeart className="mr-1" />
                              )}
                              {isFavorite ? 'Favorito' : 'Favorito'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {events.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Ver Todos los Eventos ({events.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de evento detallado */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {selectedEvent.name}
                </h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedEvent.mainImage}
                    alt={selectedEvent.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Descripción</h3>
                      <p className="text-gray-600 dark:text-slate-400">
                        {selectedEvent.longDescription || selectedEvent.description}
                      </p>
                    </div>
                    
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Etiquetas</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Información del Evento</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <FaClock className="mr-3 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-slate-100">Inicio</div>
                          <div className="text-gray-600 dark:text-slate-400">
                            {format(new Date(selectedEvent.startDate), 'dd MMMM yyyy, HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                      
                      {selectedEvent.endDate && (
                        <div className="flex items-center">
                          <FaClock className="mr-3 text-red-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">Fin</div>
                            <div className="text-gray-600 dark:text-slate-400">
                              {format(new Date(selectedEvent.endDate), 'dd MMMM yyyy, HH:mm', { locale: es })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.departureLocation && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-3 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">Salida</div>
                            <div className="text-gray-600 dark:text-slate-400">
                              {selectedEvent.departureLocation.address}, {selectedEvent.departureLocation.city}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.arrivalLocation && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-3 text-red-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">Llegada</div>
                            <div className="text-gray-600 dark:text-slate-400">
                              {selectedEvent.arrivalLocation.address}, {selectedEvent.arrivalLocation.city}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <FaUsers className="mr-3 text-purple-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-slate-100">Participantes</div>
                          <div className="text-gray-600 dark:text-slate-400">
                            {selectedEvent.currentParticipants}{selectedEvent.maxParticipants ? `/${selectedEvent.maxParticipants}` : ''} inscritos
                          </div>
                        </div>
                      </div>
                      
                      {selectedEvent.price !== undefined && (
                        <div className="flex items-center">
                          <FaMoneyBillWave className="mr-3 text-yellow-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">Precio</div>
                            <div className="text-gray-600 dark:text-slate-400">
                              {selectedEvent.price === 0 ? 'Gratis' : `$${selectedEvent.price}`}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.organizer && (
                        <div className="flex items-center">
                          <FaInfoCircle className="mr-3 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">Organizador</div>
                            <div className="text-gray-600 dark:text-slate-400">
                              {selectedEvent.organizer.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {user && (
                    <div className="flex flex-col gap-3">
                      {!userRegistrations.includes(selectedEvent._id) && selectedEvent.isRegistrationOpen && !selectedEvent.isFull && (
                        <button
                          onClick={() => handleRegisterEvent(selectedEvent._id)}
                          disabled={actionLoading[`register_${selectedEvent._id}`]}
                          className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading[`register_${selectedEvent._id}`] ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaUserPlus className="mr-2" />
                          )}
                          Registrarse en el Evento
                        </button>
                      )}
                      
                      {userRegistrations.includes(selectedEvent._id) && (
                        <button
                          onClick={() => handleUnregisterEvent(selectedEvent._id)}
                          disabled={actionLoading[`unregister_${selectedEvent._id}`]}
                          className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading[`unregister_${selectedEvent._id}`] ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaUserMinus className="mr-2" />
                          )}
                          Cancelar Registro
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleFavorite(selectedEvent._id)}
                        disabled={actionLoading[`favorite_${selectedEvent._id}`]}
                        className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg disabled:opacity-50 ${
                          userFavorites.includes(selectedEvent._id)
                            ? 'bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-600'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {actionLoading[`favorite_${selectedEvent._id}`] ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : userFavorites.includes(selectedEvent._id) ? (
                          <FaHeart className="mr-2" />
                        ) : (
                          <FaRegHeart className="mr-2" />
                        )}
                        {userFavorites.includes(selectedEvent._id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardEvents;
