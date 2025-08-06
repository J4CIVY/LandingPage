'use client';

import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Event } from '@/types/events'; // Import the Event interface
import Image from 'next/image';

/**
 * @interface EventModalProps
 * @property {Event | null} event - The event object to display in the modal. Null if no event is selected.
 * @property {() => void} onClose - Callback function to close the modal.
 */
interface EventModalProps {
  event: Event | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  // If event is null, render nothing. This check is important for conditional rendering.
  if (!event) return null;

  // Effect to control body scroll when modal is open/closed
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scroll on body
    return () => {
      document.body.style.overflow = 'auto'; // Re-enable scroll on body when component unmounts
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  /**
   * Helper function to format time strings (e.g., "14:30:00" to "14:30").
   * @param {string | undefined} timeString - The time string to format.
   * @returns {string} The formatted time string, or an empty string if input is undefined.
   */
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  /**
   * Helper function to determine difficulty level color.
   * @param {'low' | 'medium' | 'high'} difficulty - The difficulty level.
   * @returns {string} Tailwind CSS class for the background color.
   */
  const getDifficultyColor = (difficulty: 'low' | 'medium' | 'high'): string => {
    switch (difficulty) {
      case 'low': return 'bg-green-400';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * Helper function to determine event type color.
   * @param {string} type - The event type.
   * @returns {string} Tailwind CSS class for the background color.
   */
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'Ride': return 'bg-blue-500';
      case 'Meetup': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      {/* Overlay for the modal, covers the entire screen and handles closing when clicked */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose} // Close modal when overlay is clicked
        aria-hidden="true" // Hide from accessibility tree as it's just a backdrop
      />

      {/* Modal container */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog" // ARIA role for dialog
        aria-modal="true" // Indicates that the dialog is modal and blocks interaction with the rest of the page
        aria-labelledby="modal-headline" // Links to the main title of the modal for accessibility
      >
        {/* Flex container to center the modal vertically and horizontally */}
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Actual modal content area */}
          <div 
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  {/* Header with event name and close button */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl leading-6 font-bold text-gray-900" id="modal-headline">
                        {event.name}
                      </h3>
                      {/* Tags for difficulty, event type, and internal type */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getDifficultyColor((event as any).difficultyLevel)}`}>
                          {(event as any).difficultyLevel === 'low' ? 'Baja' : 
                          (event as any).difficultyLevel === 'medium' ? 'Media' : 'Alta'} dificultad
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getEventTypeColor(event.eventType)}`}>
                          {event.eventType === 'Ride' ? 'Rodada' : 'Encuentro'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-indigo-500">
                          {(event as any).internalEventType}
                        </span>
                      </div>
                    </div>
                    {/* Close button */}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      aria-label="Cerrar modal" // Accessibility label for the close button
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Event main image */}
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <Image
                      src={event.mainImage || "/default-event-image.webp"} // Fallback image if mainImage is not provided
                      alt={event.name}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                      width={1000}
                      height={400}
                    />
                  </div>

                  {/* Main content grid for event details */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Event Information & Pricing */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Información del Evento</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Fecha</p>
                            <p className="text-sm text-gray-900">
                              {/* Format start date, and end date if available */}
                              {format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                              {(event as any).endDate && ` al ${format(parseISO((event as any).endDate), "EEEE d 'de' MMMM yyyy", { locale: es })}`}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hora de encuentro</p>
                            <p className="text-sm text-gray-900">{formatTime((event as any).meetupTime)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hora de salida</p>
                            <p className="text-sm text-gray-900">{formatTime((event as any).departureTime)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Duración</p>
                            <p className="text-sm text-gray-900">{(event as any).durationDays} día(s)</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Lugar de encuentro</p>
                            <p className="text-sm text-gray-900">{event.departureLocation?.address}, {event.departureLocation?.city}</p>
                          </div>
                          
                          {(event as any).stayLocation && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Lugar de estadía</p>
                              <p className="text-sm text-gray-900">{(event as any).stayLocation.address}, {(event as any).stayLocation.city}</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Cupos disponibles</p>
                            <p className="text-sm text-gray-900">{(event as any).remainingSpots} de {(event as any).maxParticipants}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Precios</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Piloto:</span>
                            {/* Display price or 'Gratis' if not available */}
                            <span className="text-sm font-bold text-gray-900">${(event as any).basePriceRider?.toLocaleString('es-CO') || 'Gratis'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Acompañante:</span>
                            {/* Display price or 'Gratis' if not available */}
                            <span className="text-sm font-bold text-gray-900">${(event as any).basePriceCompanion?.toLocaleString('es-CO') || 'Gratis'}</span>
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

                    {/* Column 2: Itinerary & Activities */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Itinerario</h4>
                        
                        {/* Map through itinerary days */}
                        {(event as any).itinerary?.map((day: any, dayIndex: number) => (
                          <div key={dayIndex} className="mb-4">
                            <h5 className="font-semibold text-gray-700 mb-2">Día {day.day}</h5>
                            <div className="space-y-3">
                              {/* Map through activities for each day */}
                              {day.activities.map((activity: any, activityIndex: number) => (
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
                        
                        {/* Additional activities if available */}
                        {(event as any).activities && (event as any).activities.length > 0 && (
                          <>
                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-3">Actividades</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {(event as any).activities.map((activity: string, index: number) => (
                                <li key={index}>{activity}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Includes, Requirements, Recommendations, Visits */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Incluye</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {(event as any).includes?.map((item: any, index: number) => (
                            <li key={index}>
                              <span className="font-medium">{item.item}</span>
                              {item.detail && <span className="block text-gray-600">{item.detail}</span>}
                            </li>
                          ))}
                        </ul>
                        
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Requisitos</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {(event as any).requirements?.map((req: string, index: number) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                        
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Recomendaciones</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-6">
                          {(event as any).recommendations?.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                        
                        {(event as any).visits && (event as any).visits.length > 0 && (
                          <>
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Lugares a visitar</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {(event as any).visits.map((visit: string, index: number) => (
                                <li key={index}>{visit}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information section */}
                  {(event as any).additionalInformation && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-lg font-bold text-blue-800 mb-2">Información adicional</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-line">{(event as any).additionalInformation}</p>
                    </div>
                  )}

                  {/* Call to action for participation */}
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
                          href="/register" // Changed to /register as per App.jsx routes
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
    </div>
    );
  };
  
  export default EventModal;
