import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'low': return 'bg-green-400';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Ride': return 'bg-blue-500';
      case 'Meetup': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Fondo oscuro semi-transparente */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />

      {/* Contenedor del modal */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Contenido del modal */}
          <div 
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl leading-6 font-bold text-gray-900" id="modal-headline">
                        {event.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getDifficultyColor(event.difficultyLevel)}`}>
                          {event.difficultyLevel === 'low' ? 'Baja' : 
                          event.difficultyLevel === 'medium' ? 'Media' : 'Alta'} dificultad
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getEventTypeColor(event.eventType)}`}>
                          {event.eventType === 'Ride' ? 'Rodada' : 'Encuentro'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-indigo-500">
                          {event.internalEventType}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      aria-label="Cerrar modal"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Imagen principal */}
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img
                      src={event.mainImage || "/default-event-image.webp"}
                      alt={event.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  {/* Grid de información */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna 1: Información básica */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Información del Evento</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Fecha</p>
                            <p className="text-sm text-gray-900">
                              {format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                              {event.endDate && ` al ${format(parseISO(event.endDate), "EEEE d 'de' MMMM yyyy", { locale: es })}`}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hora de encuentro</p>
                            <p className="text-sm text-gray-900">{formatTime(event.meetupTime)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hora de salida</p>
                            <p className="text-sm text-gray-900">{formatTime(event.departureTime)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Duración</p>
                            <p className="text-sm text-gray-900">{event.durationDays} día(s)</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Lugar de encuentro</p>
                            <p className="text-sm text-gray-900">{event.departureLocation.address}, {event.departureLocation.city}</p>
                          </div>
                          
                          {event.stayLocation && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Lugar de estadía</p>
                              <p className="text-sm text-gray-900">{event.stayLocation.address}, {event.stayLocation.city}</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Cupos disponibles</p>
                            <p className="text-sm text-gray-900">{event.remainingSpots} de {event.maxParticipants}</p>
                          </div>
                        </div>
                      </div>

                      {/* Precios */}
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Precios</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Piloto:</span>
                            <span className="text-sm font-bold text-gray-900">${event.basePriceRider?.toLocaleString() || 'Gratis'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Acompañante:</span>
                            <span className="text-sm font-bold text-gray-900">${event.basePriceCompanion?.toLocaleString() || 'Gratis'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-100">
                          <p className="text-xs text-yellow-800">
                            * Los miembros del club obtienen descuentos según su membresía. 
                            <a href="/memberships" className="text-yellow-600 hover:underline ml-1">Ver membresías</a>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Itinerario y actividades */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Itinerario</h4>
                        
                        {event.itinerary?.map((day, dayIndex) => (
                          <div key={dayIndex} className="mb-4">
                            <h5 className="font-semibold text-gray-700 mb-2">Día {day.day}</h5>
                            <div className="space-y-3">
                              {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="flex">
                                  <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">
                                    {activity.time}
                                  </div>
                                  <div className="ml-2 text-sm text-gray-700">
                                    {activity.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {event.activities && event.activities.length > 0 && (
                          <>
                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-3">Actividades</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {event.activities.map((activity, index) => (
                                <li key={index}>{activity}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Columna 3: Requisitos y recomendaciones */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Incluye</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {event.includes?.map((item, index) => (
                            <li key={index}>
                              <span className="font-medium">{item.item}</span>
                              {item.detail && <span className="block text-gray-600">{item.detail}</span>}
                            </li>
                          ))}
                        </ul>
                        
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Requisitos</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {event.requirements?.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                        
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Recomendaciones</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {event.recommendations?.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                        
                        {event.visits && event.visits.length > 0 && (
                          <>
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Lugares a visitar</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {event.visits.map((visit, index) => (
                                <li key={index}>{visit}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {event.additionalInformation && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-lg font-bold text-blue-800 mb-2">Información adicional</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-line">{event.additionalInformation}</p>
                    </div>
                  )}

                  {/* Llamado a la acción */}
                  <div className="mt-8 bg-slate-950 p-6 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-xl font-bold text-white">¿Te gustaría participar en este evento?</h4>
                        <p className="text-gray-300 mt-1">
                          Regístrate ahora y únete a la comunidad BSK Motorcycle Team
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <a
                          href="/miembros"
                          className="px-6 py-3 bg-green-400 hover:bg-green-400 text-slate-950 font-bold rounded-full transition duration-300"
                        >
                          Regístrate ahora
                        </a>
                        <a
                          href="/memberships"
                          className="px-6 py-3 bg-white hover:bg-gray-200 text-slate-950 font-bold rounded-full transition duration-300"
                        >
                          Conoce las membresías
                        </a>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-gray-300 text-sm">
                      <p>Los miembros registrados obtienen puntos por participación que pueden canjear por beneficios exclusivos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventModal;