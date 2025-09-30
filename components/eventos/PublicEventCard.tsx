'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import ReactDOM from 'react-dom';
const PublicEventModal = React.lazy(() => import('../home/PublicEventModal'));

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
  const [showModal, setShowModal] = React.useState(false);

  const handleCardClick = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={handleCardClick}>
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
          <p className="text-red-600 dark:text-red-400 font-semibold text-sm mb-2">
            {event.startDate ? format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es }) : 'Fecha no disponible'}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
            {event.description || 'Sin descripción disponible'}
          </p>
        </div>
      </div>
      {showModal && (
        <React.Suspense fallback={null}>
          <PublicEventModal 
            event={{
              ...event,
              currentParticipants: 0,
              organizer: { name: 'Desconocido', phone: '', email: '' }
            }} 
            onClose={handleCloseModal} 
          />
        </React.Suspense>
      )}
    </>
  );
};

export default PublicEventCard;