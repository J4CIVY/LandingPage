'use client';

import React, { useState } from 'react';
import { SkeletonEvent } from '../shared/SkeletonLoaders';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';
import Calendar from "./Calendar";
import { Event } from '@/types/events';
import Image from "next/image";

/**
 * @interface EventsSectionProps
 * @property {Event[]} events - An array of event objects to display.
 * @property {boolean} loading - Indicates if the events are currently being loaded.
 * @property {string | null} error - Error message if events failed to load, otherwise null.
 */
interface EventsSectionProps {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const EventsSection: React.FC<EventsSectionProps> = ({ events, loading, error }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'calendar'>('events');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Debug logs
  console.log('📋 EventsSection: Received props:', { 
    eventsCount: events.length, 
    loading, 
    error,
    events: events.slice(0, 2) 
  });

  return (
  <section className="py-20 px-4 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          PRÓXIMOS <span className="text-green-400 dark:text-green-300">EVENTOS</span>
        </h2>

        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-full ${activeTab === 'events' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'events'}
          >
            Lista de Eventos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-full ${activeTab === 'calendar' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'calendar'}
          >
            Calendario
          </button>
        </div>

        {activeTab === 'events' ? (
          <>
            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonEvent key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400 mb-4">Error al cargar los eventos: {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="py-2 px-4"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {events.length > 0 ? (
                  events.map((event: any, index: number) => {
                    const eventDate = parseISO(event.startDate);
                    const truncatedDescription = event.description?.length > 150
                      ? `${event.description.substring(0, 150)}...`
                      : event.description;
                    return (
                      <div
                        key={event._id || index}
                        className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                        // onClick eliminado, la lógica de modal se traslada a PublicEventCard
                      >
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <Image
                            src={event.mainImage || "/default-event-image.webp"}
                            alt={event.name}
                            width={640}
                            height={360}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            quality={95}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3 line-clamp-2">
                            {event.name}
                          </h3>
                          {/* Fecha completa */}
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(eventDate, "PPPP", { locale: es })}
                          </div>
                          {/* Ubicación */}
                          {event.departureLocation && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1">
                                {event.departureLocation.city}, {event.departureLocation.country}
                              </span>
                            </div>
                          )}
                          {/* Descripción truncada */}
                          <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3">
                            {truncatedDescription}
                          </p>
                          {/* Call to Action */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              ¡Únete al BSK Motorcycle Team para acceder a todos los detalles del evento y participar en esta emocionante aventura!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <a
                                href="/register"
                                className="flex-1 bg-slate-950 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium"
                              >
                                Ser Miembro
                              </a>
                              <a
                                href="/login"
                                className="flex-1 border border-slate-950 dark:border-green-500 text-slate-950 dark:text-green-500 hover:bg-slate-950 hover:text-white dark:hover:bg-green-500 dark:hover:text-white text-center py-2 px-4 rounded-lg text-sm font-medium"
                              >
                                Iniciar Sesión
                              </a>
                            </div>
                          </div>
                          {/* Información adicional */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            <p>Como miembro del club podrás:</p>
                            <p>• Ver detalles completos del evento • Registrarte para participar • Acceder a eventos exclusivos</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-xl">No hay eventos programados en este momento</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-red-600 dark:text-red-400 mr-2" aria-hidden="true" />
              <h3 className="text-xl font-bold">Calendario de Eventos</h3>
            </div>
            <Calendar 
              events={events} 
              currentMonth={currentMonth} 
              setCurrentMonth={setCurrentMonth} 
            />
          </div>
        )}
      </div>

      {/* PublicEventModal eliminado, ahora solo se muestra en PublicEventCard */}
    </section>
  );
};

export default EventsSection;
