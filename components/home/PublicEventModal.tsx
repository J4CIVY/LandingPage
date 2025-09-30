'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaTag,
  FaMountain,
  FaRoute,
  FaTimes,
  FaUserPlus,
  FaSignInAlt,
  FaMoneyBillWave,
  FaInfoCircle
} from 'react-icons/fa';
import Image from 'next/image';

interface Event {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate?: string;
  mainImage: string;
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
  registrationOpenDate?: string;
  registrationDeadline?: string;
  price?: number;
  nonMemberPrice?: number;
  includedServices?: string[];
  requirements?: string[];
  distance?: number;
  duration?: number;
  organizer: {
    name: string;
    phone: string;
    email: string;
  };
  tags?: string[];
}

interface PublicEventModalProps {
  event: Event | null;
  onClose: () => void;
}

const PublicEventModal: React.FC<PublicEventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  // Solo renderizar en el cliente
  if (typeof document === 'undefined') return null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty?: string): string => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return 'No especificado';
    }
  };

  const getEventTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'social': return 'bg-blue-500';
      case 'touring': return 'bg-green-500';
      case 'training': return 'bg-purple-500';
      case 'competition': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isRegistrationOpen = (): boolean => {
    const now = new Date();
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.startDate);
    const isFull = event.maxParticipants !== undefined && event.currentParticipants >= event.maxParticipants;
    return now < registrationDeadline && !isFull;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 z-[9999] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
            
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 px-6 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {event.name}
                  </h2>
                </div>
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                  aria-label="Cerrar modal"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Event Image */}
            <div className="px-6">
              <div className="relative rounded-lg overflow-hidden aspect-video">
                <Image
                  src={event.mainImage || "/default-event-image.webp"}
                  alt={event.name}
                  fill
                  className="object-cover bg-gray-100 dark:bg-slate-900"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Información del evento */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Descripción */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Descripción
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {event.longDescription || event.description}
                    </p>
                  </div>

                  {/* Servicios incluidos */}
                  {event.includedServices && event.includedServices.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Servicios incluidos
                      </h3>
                      <ul className="space-y-2">
                        {event.includedServices.map((service, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 dark:text-green-400 mr-2 mt-1">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requisitos */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Requisitos
                      </h3>
                      <ul className="space-y-2">
                        {event.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 dark:text-blue-400 mr-2 mt-1">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Panel lateral - Información y precios */}
                <div className="space-y-4">
                  
                  {/* Información básica */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Información del evento
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <FaCalendarAlt className="text-blue-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(parseISO(event.startDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {format(parseISO(event.startDate), "HH:mm", { locale: es })} hrs
                          </p>
                        </div>
                      </div>

                      {event.departureLocation && (
                        <div className="flex items-start text-sm">
                          <FaMapMarkerAlt className="text-red-500 mr-3 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Punto de encuentro</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {event.departureLocation.address}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {event.departureLocation.city}, {event.departureLocation.country}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-sm">
                        <FaUsers className="text-green-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Participantes</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''} inscritos
                          </p>
                        </div>
                      </div>

                      {event.duration && (
                        <div className="flex items-center text-sm">
                          <FaClock className="text-purple-500 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Duración</p>
                            <p className="text-gray-600 dark:text-gray-400">{event.duration} horas</p>
                          </div>
                        </div>
                      )}

                      {event.distance && (
                        <div className="flex items-center text-sm">
                          <FaRoute className="text-orange-500 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Distancia</p>
                            <p className="text-gray-600 dark:text-gray-400">{event.distance} km</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FaMoneyBillWave className="text-blue-500 mr-2" />
                      Precios
                    </h3>
                    
                    <div className="space-y-3">
                      {event.price !== undefined && event.price > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Miembros del club:
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(event.price)}
                          </span>
                        </div>
                      )}
                      
                      {event.nonMemberPrice !== undefined && event.nonMemberPrice > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No miembros:
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(event.nonMemberPrice)}
                          </span>
                        </div>
                      )}

                      {(!event.price || event.price === 0) && (!event.nonMemberPrice || event.nonMemberPrice === 0) && (
                        <div className="text-center">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            GRATIS
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información sobre membresías */}
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start">
                        <FaInfoCircle className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          Los miembros del club obtienen tarifas preferenciales y puntos por participación.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      ¿Quieres participar?
                    </h3>
                    
                    {isRegistrationOpen() ? (
                      <div className="space-y-3">
                        <p className="text-gray-300 dark:text-gray-300 text-sm">
                          Si ya eres miembro, inicia sesión para registrarte con tarifa preferencial. 
                          Si no eres miembro, regístrate y obtén beneficios exclusivos.
                        </p>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          >
                            <FaSignInAlt className="mr-2" />
                            Iniciar sesión (Miembros)
                          </button>
                          
                          <button
                            onClick={() => window.location.href = '/register'}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          >
                            <FaUserPlus className="mr-2" />
                            Registrarse (Nuevos miembros)
                          </button>
                        </div>
                        
                        <div className="text-center">
                          <a
                            href="/memberships"
                            className="text-sm text-blue-400 dark:text-blue-300 hover:underline"
                          >
                            Conocer beneficios de las membresías
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-300 dark:text-gray-300 text-sm mb-3">
                          {event.maxParticipants && event.currentParticipants >= event.maxParticipants
                            ? 'Este evento está lleno'
                            : 'Las inscripciones para este evento han cerrado'
                          }
                        </p>
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-lg cursor-not-allowed"
                        >
                          Inscripciones cerradas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con información del organizador */}
            <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Organizado por: <span className="font-medium text-gray-900 dark:text-white">{event.organizer.name}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={`tel:${event.organizer.phone}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {event.organizer.phone}
                  </a>
                  <a
                    href={`mailto:${event.organizer.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {event.organizer.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PublicEventModal;