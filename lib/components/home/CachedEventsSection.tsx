'use cache';

/**
 * Cached Events Section Component
 * 
 * Uses React 19's 'use cache' directive with dynamic data from cached fetch.
 * This component will be cached but can be revalidated based on cache tags.
 */

import React from "react";
import { getCachedEvents } from "@/lib/cache-utils";
import Image from "next/image";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  isFree: boolean;
  status: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function CachedEventsSection() {
  // Fetch events using cached function
  const { events = [] } = await getCachedEvents(true);
  
  // Show only first 6 events
  const displayEvents = events.slice(0, 6);

  if (displayEvents.length === 0) {
    return (
      <section 
        id="events-section"
        className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Próximos Eventos
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Actualmente no hay eventos próximos. ¡Mantente atento!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="events-section"
      className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900"
      aria-labelledby="events-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            id="events-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Próximos Eventos
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Únete a nuestras rodadas, talleres y actividades diseñadas para toda la comunidad motera
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayEvents.map((event: Event) => (
            <article
              key={event._id}
              className="bg-white dark:bg-slate-950 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Event Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-500 to-red-700">
                    <FaCalendarAlt className="text-6xl text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                {event.status === 'published' && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Disponible
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                  {event.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {/* Date */}
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-red-600" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-red-600" />
                    <span>{formatTime(event.startDate)}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  {/* Participants */}
                  {event.maxParticipants && (
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-red-600" />
                      <span>
                        {event.currentParticipants}/{event.maxParticipants} inscritos
                      </span>
                    </div>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {event.isFree ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      <span>${event.price?.toLocaleString('es-CO')}</span>
                    )}
                  </div>
                  <a
                    href={`/events/${event._id}`}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    Ver Más
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Events CTA */}
        <div className="text-center">
          <a
            href="/events"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Ver Todos los Eventos
          </a>
        </div>
      </div>
    </section>
  );
}
