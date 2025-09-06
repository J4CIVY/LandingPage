'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaSpinner,
  FaExclamationTriangle,
  FaUserPlus,
  FaUserMinus,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaTag,
  FaDollarSign,
  FaRoute,
  FaCogs
} from 'react-icons/fa';

interface Event {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate?: string;
  mainImage: string;
  gallery?: string[];
  eventType: string;
  status: string;
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
  currentParticipants: number;
  maxParticipants?: number;
  registrationDeadline?: string;
  price?: number;
  includedServices?: string[];
  requirements?: string[];
  difficulty?: string;
  distance?: number;
  duration?: number;
  organizer?: {
    name: string;
    phone: string;
    email: string;
  };
  tags?: string[];
  isActive: boolean;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processing, setProcessing] = useState(false);

  const eventId = params.id as string;

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Evento no encontrado');
      }

      const data = await response.json();
      if (data.success && data.data?.event) {
        setEvent(data.data.event);
      } else {
        throw new Error('Error al cargar el evento');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventData = async () => {
    if (!user || !eventId) return;

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
        const registrations = regData.data?.registrations || [];
        setIsRegistered(registrations.includes(eventId));
      }

      if (favoritesRes.ok) {
        const favData = await favoritesRes.json();
        const favorites = favData.data?.favorites || [];
        setIsFavorite(favorites.includes(eventId));
      }
    } catch (error) {
      console.error('Error fetching user event data:', error);
    }
  };

  const handleEventRegistration = async (action: 'register' | 'unregister') => {
    if (!user || processing) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: action === 'register' ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsRegistered(action === 'register');
        if (event) {
          setEvent(prev => prev ? {
            ...prev,
            currentParticipants: action === 'register' 
              ? prev.currentParticipants + 1
              : Math.max(0, prev.currentParticipants - 1)
          } : null);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
      }
    } catch (error) {
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || processing) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
      }
    } catch (error) {
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (user && eventId) {
      fetchUserEventData();
    }
  }, [user, eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Error</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-400">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  const isEventFull = Boolean(event.maxParticipants && event.currentParticipants >= event.maxParticipants);
  const isRegistrationClosed = Boolean(event.registrationDeadline && new Date(event.registrationDeadline) < new Date());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Imagen principal */}
            <div className="aspect-video w-full">
              <img
                src={event.mainImage}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/default-event.jpg';
                }}
              />
            </div>

            {/* Contenido principal */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                    {event.name}
                  </h1>

                  {/* Estados del evento */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <FaTag className="mr-1" />
                      {event.eventType}
                    </span>
                    
                    {isRegistered && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <FaCheckCircle className="mr-1" />
                        Registrado
                      </span>
                    )}
                    
                    {isEventFull && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <FaTimesCircle className="mr-1" />
                        Evento Lleno
                      </span>
                    )}
                  </div>

                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600 dark:text-slate-400">
                      <FaClock className="mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">Inicio</p>
                        <p>{new Date(event.startDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                    </div>

                    {event.departureLocation && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaMapMarkerAlt className="mr-3 text-red-500" />
                        <div>
                          <p className="font-medium">Salida</p>
                          <p>{event.departureLocation.address}, {event.departureLocation.city}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600 dark:text-slate-400">
                      <FaUsers className="mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Participantes</p>
                        <p>{event.currentParticipants}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</p>
                      </div>
                    </div>

                    {event.price && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaDollarSign className="mr-3 text-yellow-500" />
                        <div>
                          <p className="font-medium">Precio</p>
                          <p>${event.price.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                      Descripción
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                      {event.longDescription || event.description}
                    </p>
                  </div>

                  {/* Detalles adicionales */}
                  {(event.distance || event.duration || event.difficulty) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {event.distance && (
                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                          <FaRoute className="mr-2 text-purple-500" />
                          <div>
                            <p className="font-medium">Distancia</p>
                            <p>{event.distance} km</p>
                          </div>
                        </div>
                      )}

                      {event.duration && (
                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                          <FaClock className="mr-2 text-orange-500" />
                          <div>
                            <p className="font-medium">Duración</p>
                            <p>{event.duration} horas</p>
                          </div>
                        </div>
                      )}

                      {event.difficulty && (
                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                          <FaCogs className="mr-2 text-indigo-500" />
                          <div>
                            <p className="font-medium">Dificultad</p>
                            <p className="capitalize">{event.difficulty}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="lg:w-80">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-3">
                    {user ? (
                      <>
                        {/* Botón de registro */}
                        {isRegistered ? (
                          <button
                            onClick={() => handleEventRegistration('unregister')}
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 dark:bg-red-500 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing ? (
                              <FaSpinner className="mr-2 animate-spin" />
                            ) : (
                              <FaUserMinus className="mr-2" />
                            )}
                            Cancelar Registro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEventRegistration('register')}
                            disabled={processing || isEventFull || isRegistrationClosed}
                            className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 dark:bg-green-500 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing ? (
                              <FaSpinner className="mr-2 animate-spin" />
                            ) : (
                              <FaUserPlus className="mr-2" />
                            )}
                            {isEventFull ? 'Evento Lleno' : isRegistrationClosed ? 'Registro Cerrado' : 'Registrarse'}
                          </button>
                        )}

                        {/* Botón de favorito */}
                        <button
                          onClick={handleFavoriteToggle}
                          disabled={processing}
                          className={`w-full inline-flex items-center justify-center px-4 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFavorite
                              ? 'bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-600'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {processing ? (
                            <FaSpinner className="mr-2 animate-spin" />
                          ) : isFavorite ? (
                            <FaHeart className="mr-2" />
                          ) : (
                            <FaRegHeart className="mr-2" />
                          )}
                          {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-slate-400 mb-3">
                          Inicia sesión para registrarte en este evento
                        </p>
                        <button
                          onClick={() => router.push('/login')}
                          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Iniciar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
