'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';

interface PublicEventCardProps {
  event: {
    _id: string;
    name: string;
    startDate: string;
    description: string;
    mainImage: string;
    eventType: string;
    departureLocation?: {
      address: string;
      city: string;
      country: string;
    };
  };
}

/**
 * Componente de tarjeta pública para eventos - información básica para visitantes no registrados
 */
const PublicEventCard: React.FC<PublicEventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  
  // Descripción truncada para vista pública
  const truncatedDescription = event.description.length > 150 
    ? `${event.description.substring(0, 150)}...` 
    : event.description;

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        <Image
          src={event.mainImage || "/default-event-image.webp"}
          alt={event.name}
          className="w-full h-full object-contain"
          loading="lazy"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay con fecha */}
        <div className="absolute top-4 left-4 bg-slate-950 dark:bg-green-500 text-white px-3 py-2 rounded-lg">
          <p className="text-sm font-bold">
            {format(eventDate, "dd", { locale: es })}
          </p>
          <p className="text-xs uppercase">
            {format(eventDate, "MMM", { locale: es })}
          </p>
        </div>
        
        {/* Tipo de evento */}
        <div className="absolute top-4 right-4 bg-green-500 dark:bg-slate-950 text-white px-3 py-1 rounded-full text-xs font-medium">
          {event.eventType === 'Ride' ? 'Rodada' : 'Evento'}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3 line-clamp-2">
          {event.name}
        </h3>
        
        {/* Fecha completa */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {format(eventDate, "PPPP", { locale: es })}
        </div>
        
        {/* Ubicación */}
        {event.departureLocation && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <Link 
              href="/register"
              className="flex-1 bg-slate-950 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg transition-colors duration-300 text-sm font-medium"
            >
              Ser Miembro
            </Link>
            <Link 
              href="/login"
              className="flex-1 border border-slate-950 dark:border-green-500 text-slate-950 dark:text-green-500 hover:bg-slate-950 hover:text-white dark:hover:bg-green-500 dark:hover:text-white text-center py-2 px-4 rounded-lg transition-colors duration-300 text-sm font-medium"
            >
              Iniciar Sesión
            </Link>
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
};

export default PublicEventCard;