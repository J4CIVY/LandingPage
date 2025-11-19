'use client';

import { type FC } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { sanitizeText } from '@/lib/input-sanitization';

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
const PublicEventCard: FC<PublicEventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  
  // SECURITY: Sanitize user-generated content to prevent XSS
  const safeName = sanitizeText(event.name, 100);
  const safeDescription = sanitizeText(event.description, 500);
  const truncatedDescription = safeDescription?.length > 150
    ? `${safeDescription.substring(0, 150)}...`
    : safeDescription;

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <Image
          src={event.mainImage || "/default-event-image.webp"}
          alt={`${event.name} - ${event.eventType || 'Evento'} organizado por BSK Motorcycle Team${event.departureLocation?.city ? ` en ${event.departureLocation.city}, ${event.departureLocation.country || 'Colombia'}` : ' en Colombia'}`}
          width={640}
          height={360}
          className="w-full h-full object-contain"
          loading="lazy"
          quality={95}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
        {/* ✅ SEO OPTIMIZATION: Enhanced alt text with descriptive context
            - Includes event name, type, organizer, and location
            - Better for image SEO and accessibility
            - Keywords naturally integrated (BSK Motorcycle Team, location)
        */}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3 line-clamp-2">
          {safeName}
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
            <svg className="w-4 h-4 mr-2 shrink-0 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        <div className="bg-linear-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            ¡Únete a BSK Motorcycle Team para acceder a todos los detalles del evento y participar en esta emocionante aventura!
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
};

export default PublicEventCard;