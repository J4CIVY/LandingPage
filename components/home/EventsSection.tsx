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
        <h2 className="text-4xl font-bold text-center mb-12">
          PRÓXIMOS <span className="text-green-400">EVENTOS</span>
        </h2>

        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-full transition-colors ${activeTab === 'events' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'events'} // ARIA attribute for toggle buttons
          >
            Lista de Eventos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-full transition-colors ${activeTab === 'calendar' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'}`}
            aria-pressed={activeTab === 'calendar'} // ARIA attribute for toggle buttons
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
                  events.map((event: any, index: number) => (
                    <div 
                      key={event._id || index}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      onClick={() => handleEventClick(event)}
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
                      <div className="p-4">
                        <p className="text-red-600 font-semibold text-sm mb-2">
                          {event.startDate ? format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es }) : 'Fecha no disponible'}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                          {event.description || 'Sin descripción disponible'}
                        </p>
                      </div>
                    </div>
                  ))
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
              <FaCalendarAlt className="text-red-600 mr-2" aria-hidden="true" />
              <h3 className="text-xl font-bold">Calendario de Eventos</h3>
            </div>
            <Calendar 
              events={events} 
              currentMonth={currentMonth} 
              setCurrentMonth={setCurrentMonth} 
              onEventClick={handleEventClick} // Pass the handler to Calendar
            />
          </div>
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
