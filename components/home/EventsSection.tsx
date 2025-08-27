'use client';

import React, { useState, useEffect } from 'react';
import { SkeletonEvent } from '../shared/SkeletonLoaders';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';
import Calendar from "./Calendar";
import EventModal from "./EventModal";
import { Event } from '@/types/events'; // Import the Event interface
import Image from "next/image";
import { AnimatedHeading, AnimatedText } from "@/components/animations/AnimatedText";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /**
   * Handles the click event on an event card or calendar event, setting the selected event
   * and opening the event modal.
   * @param {Event} event - The event object that was clicked.
   */
  const handleEventClick = (event: Event): void => {
    setSelectedEvent(event);
  };

  /**
   * Handles the closing of the event modal, resetting the selected event state.
   */
  const handleCloseModal = (): void => {
    setSelectedEvent(null);
  };

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedHeading 
          level={2}
          animationType="slideUp"
          delay={100}
          className="text-4xl font-bold text-center mb-12"
        >
          PRÓXIMOS <span className="text-green-400">EVENTOS</span>
        </AnimatedHeading>

        <AnimatedText
          animationType="fadeIn"
          delay={200}
          className="mb-8 flex justify-center space-x-4"
        >
          <AnimatedButton
            onClick={() => setActiveTab('events')}
            animationType="scaleIn"
            delay={250}
            className={`px-6 py-2 rounded-full ${activeTab === 'events' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'events'} // ARIA attribute for toggle buttons
          >
            Lista de Eventos
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setActiveTab('calendar')}
            animationType="scaleIn"
            delay={300}
            className={`px-6 py-2 rounded-full ${activeTab === 'calendar' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'calendar'} // ARIA attribute for toggle buttons
          >
            Calendario
          </AnimatedButton>
        </AnimatedText>

        {activeTab === 'events' ? (
          <>
            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonEvent key={index} />
                ))}
              </div>
            ) : error ? (
              <AnimatedText
                animationType="slideUp"
                delay={300}
                className="text-center py-10"
              >
                <p className="text-red-400 mb-4">Error al cargar los eventos: {error}</p>
                <AnimatedButton 
                  onClick={() => window.location.reload()}
                  animationType="scaleIn"
                  delay={100}
                  variant="secondary"
                  className="py-2 px-4"
                >
                  Reintentar
                </AnimatedButton>
              </AnimatedText>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {events.length > 0 ? (
                  events.map((event: any, index: number) => (
                    <AnimatedText
                      key={event._id}
                      animationType="slideUp"
                      delay={300 + (index * 100)}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105"
                    >
                      <div className="relative" style={{ aspectRatio: '16/9' }}>
                        <Image
                          src={event.mainImage || "/default-event-image.webp"}
                          alt={event.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          layout="fill"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                        <p className="text-red-600 font-semibold mb-3">
                          {/* Ensure event.startDate is a valid ISO string before parsing */}
                          {event.startDate ? format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es }) : 'Fecha no disponible'}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.departureLocation?.address || 'Ubicación no disponible'}
                        </p>
                        <AnimatedButton 
                          onClick={() => handleEventClick(event)}
                          animationType="scaleIn"
                          delay={500 + (index * 100)}
                          variant="primary"
                          className="mt-4 w-full py-2 rounded-full"
                          aria-label={`Más información sobre ${event.name}`}
                        >
                          Más información
                        </AnimatedButton>
                      </div>
                    </AnimatedText>
                  ))
                ) : (
                  <AnimatedText
                    animationType="fadeIn"
                    delay={300}
                    className="col-span-3 text-center py-10"
                  >
                    <p className="text-xl">No hay eventos programados en este momento</p>
                  </AnimatedText>
                )}
              </div>
            )}
          </>
        ) : (
          <AnimatedText
            animationType="slideUp"
            delay={300}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-red-600 mr-2" aria-hidden="true" />
              <h3 className="text-xl font-bold">Calendario de Eventos</h3>
            </div>
            <Calendar 
              events={events} 
              currentMonth={currentMonth} 
              setCurrentMonth={setCurrentMonth} 
              onEventClick={handleEventClick} // Pass the handler to Calendar
            />
          </AnimatedText>
        )}
      </div>

      {/* Render EventModal conditionally */}
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={handleCloseModal} // Pass the close handler
        />
      )}
    </section>
  );
};

export default EventsSection;
