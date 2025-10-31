'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCSRFToken } from '@/lib/csrf-client';
import BoldCheckoutButton from '@/components/shared/BoldCheckoutButton';
import {
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
  FaCogs,
  FaAward,
  FaFileDownload,
  FaCalendarCheck,
  FaClipboardList,
  FaExclamationCircle
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
  registrationOpenDate?: string; // Fecha de apertura de inscripciones
  registrationDeadline?: string;
  price?: number;
  includedServices?: string[];
  requirements?: string[];
  difficulty?: string;
  distance?: number;
  duration?: number;
  pointsAwarded?: number; // Puntos que otorga este evento
  detailsPdf?: string; // URL del PDF con detalles del evento
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
  const [paymentConfig, setPaymentConfig] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    integritySignature: string;
    orderId: string;
  } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventData = async () => {
    if (!user || !eventId) return;

    try {
      const [registrationsRes, favoritesRes, paymentRes] = await Promise.all([
        fetch('/api/users/events/registrations', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/users/events/favorites', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        // Verificar si hay un pago aprobado para este evento
        fetch(`/api/bold/transactions/check-payment?eventId=${eventId}`, {
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

      // Si hay un pago aprobado, marcar como registrado automáticamente
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        if (paymentData.success && paymentData.data?.hasApprovedPayment) {
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user event data:', error);
    }
  };

  const handleEventRegistration = async (action: 'register' | 'unregister') => {
    if (!user || processing) return;

    setProcessing(true);
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: action === 'register' ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
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
        console.error('Registration error from server:', errorData);
        
        // Si el error es por pago aprobado, redirigir a PQRSDF
        if (errorData.message && errorData.message.includes('pago aprobado')) {
          const confirmar = confirm(
            'Tienes un pago aprobado para este evento. Para cancelar tu inscripción necesitas solicitar un reembolso a través de nuestro sistema PQRSDF.\n\n¿Deseas iniciar la solicitud de reembolso ahora?'
          );
          
          if (confirmar && event) {
            // Redirigir al formulario PQRSDF con datos prellenados
            const params = new URLSearchParams({
              categoria: 'peticion',
              subcategoria: 'reembolso',
              eventoId: event._id,
              eventoNombre: event.name,
              precio: event.price?.toString() || '0'
            });
            router.push(`/dashboard/pqrsdf/nueva?${params.toString()}`);
          }
        } else {
          alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
        }
      }
    } catch (error) {
      console.error('Registration exception:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || processing) return;

    setProcessing(true);
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo completar la acción'}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreatePaymentTransaction = async () => {
    if (!user || !event || loadingPayment) return;

    setLoadingPayment(true);
    try {
      const response = await fetch('/api/bold/transactions/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          amount: event.price,
          description: `Inscripción a ${event.name}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la transacción');
        }
  
        const data = await response.json();      if (data.success && data.data) {
        setPaymentConfig({
          config: data.data.config,
          integritySignature: data.data.integritySignature,
          orderId: data.data.orderId
        });
        return true;
      } else {
        console.error('Invalid server response:', data);
        throw new Error('Respuesta inválida del servidor');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating payment transaction:', error);
      alert(`Error al iniciar el pago: ${error.message || 'Intenta de nuevo'}`);
      return false;
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePdfDownload = () => {
    if (event?.detailsPdf) {
      const link = document.createElement('a');
      link.href = event.detailsPdf;
      // Agregar la extensión .pdf si no la tiene
      const fileName = event.detailsPdf.includes('.pdf') 
        ? event.detailsPdf.split('/').pop() || 'evento-detalles.pdf'
        : 'evento-detalles.pdf';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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

                  {/* Información de registro y puntos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {event.registrationOpenDate && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaCalendarCheck className="mr-3 text-green-500" />
                        <div>
                          <p className="font-medium">Apertura de Inscripciones</p>
                          <p>{new Date(event.registrationOpenDate).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    )}

                    {event.registrationDeadline && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaClock className="mr-3 text-orange-500" />
                        <div>
                          <p className="font-medium">Cierre de Inscripciones</p>
                          <p>{new Date(event.registrationDeadline).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    )}

                    {event.pointsAwarded && event.pointsAwarded > 0 && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaAward className="mr-3 text-yellow-500" />
                        <div>
                          <p className="font-medium">Puntos que Otorga</p>
                          <p className="font-bold text-yellow-600 dark:text-yellow-400">{event.pointsAwarded} puntos</p>
                        </div>
                      </div>
                    )}

                    {event.detailsPdf && (
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <FaFileDownload className="mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">Documento de Detalles</p>
                          <button 
                            onClick={handlePdfDownload}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Servicios incluidos */}
                  {event.includedServices && event.includedServices.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                        <FaClipboardList className="mr-2 text-blue-500" />
                        Servicios Incluidos
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {event.includedServices.map((service, index) => (
                            <li key={index} className="flex items-center text-gray-700 dark:text-slate-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 shrink-0"></span>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                        <FaExclamationCircle className="mr-2 text-orange-500" />
                        Requisitos
                      </h3>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <ul className="space-y-2">
                          {event.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start text-gray-700 dark:text-slate-300">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 shrink-0"></span>
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

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
                        {/* Botón de registro o pago */}
                        {isRegistered ? (
                          <button
                            onClick={() => handleEventRegistration('unregister')}
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 dark:bg-red-500 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing ? (
                              <FaSpinner className="mr-2 animate-spin" />
                            ) : (
                              <FaUserMinus className="mr-2" />
                            )}
                            Cancelar Registro
                          </button>
                        ) : (
                          <>
                            {/* Si el evento tiene precio, mostrar botón de pago Bold */}
                            {event.price && event.price > 0 ? (
                              <div className="space-y-2">
                                <div className="text-center mb-2">
                                  <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Este evento requiere pago
                                  </p>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                    ${event.price.toLocaleString('es-CO')} COP
                                  </p>
                                </div>
                                
                                {paymentConfig ? (
                                  /* Botón de pago Bold */
                                  <BoldCheckoutButton
                                    config={paymentConfig.config}
                                    integritySignature={paymentConfig.integritySignature}
                                    disabled={isEventFull || isRegistrationClosed}
                                    buttonText="Pagar Inscripción"
                                    buttonClassName="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                                    onPaymentStart={() => {
                                    }}
                                    onPaymentSuccess={() => {
                                      router.push(`/events/${event._id}/payment-result?orderId=${paymentConfig.orderId}`);
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onPaymentError={(error: any) => {
                                      console.error('Error en el pago:', error);
                                      alert(`Error al procesar el pago: ${error.message || 'Intenta de nuevo'}`);
                                      // Resetear para permitir intentar de nuevo
                                      setPaymentConfig(null);
                                    }}
                                  />
                                ) : (
                                  /* Botón para iniciar el proceso de pago */
                                  <button
                                    onClick={handleCreatePaymentTransaction}
                                    disabled={loadingPayment || isEventFull || isRegistrationClosed}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingPayment ? (
                                      <>
                                        <FaSpinner className="mr-2 animate-spin" />
                                        Preparando pago...
                                      </>
                                    ) : (
                                      <>
                                        <FaDollarSign className="mr-2" />
                                        Comprar Inscripción
                                      </>
                                    )}
                                  </button>
                                )}
                                
                                {(isEventFull || isRegistrationClosed) && (
                                  <p className="text-sm text-center text-red-600 dark:text-red-400">
                                    {isEventFull ? 'Evento lleno' : 'Registro cerrado'}
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Si el evento es gratis, mostrar botón de registro normal */
                              <button
                                onClick={() => handleEventRegistration('register')}
                                disabled={processing || isEventFull || isRegistrationClosed}
                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 dark:bg-green-500 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processing ? (
                                  <FaSpinner className="mr-2 animate-spin" />
                                ) : (
                                  <FaUserPlus className="mr-2" />
                                )}
                                {isEventFull ? 'Evento Lleno' : isRegistrationClosed ? 'Registro Cerrado' : 'Registrarse Gratis'}
                              </button>
                            )}
                          </>
                        )}

                        {/* Botón de favorito */}
                        <button
                          onClick={handleFavoriteToggle}
                          disabled={processing}
                          className={`w-full inline-flex items-center justify-center px-4 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
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
                          Inicia sesión para {event.price && event.price > 0 ? 'comprar tu entrada' : 'registrarte en este evento'}
                        </p>
                        <button
                          onClick={() => router.push('/login')}
                          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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
