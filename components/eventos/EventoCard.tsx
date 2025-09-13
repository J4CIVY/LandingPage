'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock,
  FaUser,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaRoute,
  FaMoneyBillWave
} from 'react-icons/fa';
import { Event } from '@/types/events';

interface EventoCardProps {
  event: Event;
  currentUser: any;
  onClick: () => void;
  onRegister: () => void;
  onUnregister: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventoCard({
  event,
  currentUser,
  onClick,
  onRegister,
  onUnregister,
  onEdit,
  onDelete
}: EventoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determinar el estado del evento
  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;

    if (event.status === 'cancelled') {
      return { label: 'Cancelado', color: 'bg-red-500', textColor: 'text-red-600' };
    }
    
    if (event.status === 'completed' || now > endDate) {
      return { label: 'Finalizado', color: 'bg-gray-500', textColor: 'text-gray-600' };
    }
    
    if (now >= startDate && now <= endDate) {
      return { label: 'En curso', color: 'bg-blue-500', textColor: 'text-blue-600' };
    }
    
    return { label: 'Próximo', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  // Verificar si el usuario está inscrito
  const isUserRegistered = event.participants?.includes(currentUser?.id) || false;

  // Verificar si el usuario es admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  // Verificar si el evento está lleno
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;

  // Verificar si la inscripción está abierta
  const isRegistrationOpen = () => {
    const now = new Date();
    const registrationDeadline = event.registrationDeadline 
      ? new Date(event.registrationDeadline) 
      : new Date(event.startDate);
    
    return now < registrationDeadline && 
           event.status === 'published' && 
           !isFull;
  };

  const eventStatus = getEventStatus();
  const canRegister = isRegistrationOpen() && !isUserRegistered;
  const canUnregister = isUserRegistered && getEventStatus().label !== 'Finalizado';

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar acción de inscripción
  const handleAction = async (action: 'register' | 'unregister', e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      if (action === 'register') {
        await onRegister();
      } else {
        await onUnregister();
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar acciones de admin
  const handleAdminAction = (action: 'edit' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (action === 'edit') {
      onEdit();
    } else if (action === 'delete') {
      onDelete();
    }
  };

  return (
    <div 
      className="
        bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg 
        transition-all duration-300 cursor-pointer transform hover:scale-105
        border border-gray-200 dark:border-slate-700 overflow-hidden
      "
      onClick={onClick}
    >
      {/* Imagen del evento */}
      <div className="relative h-48 bg-gray-200 dark:bg-slate-700">
        {!imageError && event.mainImage ? (
          <Image
            src={event.mainImage}
            alt={event.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <FaCalendarAlt className="text-6xl text-white opacity-70" />
          </div>
        )}
        
        {/* Badge de estado */}
        <div className="absolute top-3 left-3">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium text-white
            ${eventStatus.color}
          `}>
            {eventStatus.label}
          </span>
        </div>

        {/* Badge de precio */}
        {event.price && event.price > 0 && (
          <div className="absolute top-3 right-3">
            <span className="
              px-2 py-1 rounded-full text-xs font-medium 
              bg-yellow-500 text-white
              flex items-center space-x-1
            ">
              <FaMoneyBillWave className="text-xs" />
              <span>${event.price.toLocaleString()}</span>
            </span>
          </div>
        )}

        {/* Badge de inscrito */}
        {isUserRegistered && (
          <div className="absolute bottom-3 right-3">
            <span className="
              px-2 py-1 rounded-full text-xs font-medium 
              bg-green-500 text-white
              flex items-center space-x-1
            ">
              <FaCheckCircle className="text-xs" />
              <span>Inscrito</span>
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        {/* Título y tipo */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1 line-clamp-2">
            {event.name}
          </h3>
          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
            {event.eventType}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Información del evento */}
        <div className="space-y-2 mb-4">
          {/* Fecha y hora */}
          <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
            <FaCalendarAlt className="mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">
              {formatDate(event.startDate)} - {formatTime(event.startDate)}
            </span>
          </div>

          {/* Ubicación */}
          {event.departureLocation && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FaMapMarkerAlt className="mr-2 text-red-500 flex-shrink-0" />
              <span className="truncate">
                {event.departureLocation.city}, {event.departureLocation.country}
              </span>
            </div>
          )}

          {/* Duración */}
          {event.duration && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FaClock className="mr-2 text-green-500 flex-shrink-0" />
              <span>{event.duration}h de duración</span>
            </div>
          )}

          {/* Distancia */}
          {event.distance && (
            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
              <FaRoute className="mr-2 text-purple-500 flex-shrink-0" />
              <span>{event.distance} km</span>
            </div>
          )}

          {/* Participantes */}
          <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
            <FaUsers className="mr-2 text-orange-500 flex-shrink-0" />
            <span>
              {event.currentParticipants}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participantes
            </span>
            {isFull && (
              <FaExclamationTriangle className="ml-2 text-amber-500" title="Evento lleno" />
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col space-y-2">
          {/* Botones principales */}
          <div className="flex space-x-2">
            {/* Ver detalles */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="
                flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 
                text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg text-sm font-medium 
                transition-colors flex items-center justify-center space-x-1
              "
            >
              <FaEye className="text-xs" />
              <span>Ver detalles</span>
            </button>

            {/* Botón de inscripción/cancelación */}
            {canRegister && (
              <button
                onClick={(e) => handleAction('register', e)}
                disabled={loading}
                className="
                  flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 
                  text-white px-3 py-2 rounded-lg text-sm font-medium 
                  transition-colors flex items-center justify-center space-x-1
                "
              >
                <FaUser className="text-xs" />
                <span>{loading ? 'Inscribiendo...' : 'Inscribirme'}</span>
              </button>
            )}

            {canUnregister && (
              <button
                onClick={(e) => handleAction('unregister', e)}
                disabled={loading}
                className="
                  flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 
                  text-white px-3 py-2 rounded-lg text-sm font-medium 
                  transition-colors flex items-center justify-center space-x-1
                "
              >
                <FaTimes className="text-xs" />
                <span>{loading ? 'Cancelando...' : 'Cancelar'}</span>
              </button>
            )}
          </div>

          {/* Botones de admin */}
          {isAdmin && (
            <div className="flex space-x-2">
              <button
                onClick={(e) => handleAdminAction('edit', e)}
                className="
                  flex-1 bg-blue-600 hover:bg-blue-700 
                  text-white px-3 py-2 rounded-lg text-sm font-medium 
                  transition-colors flex items-center justify-center space-x-1
                "
              >
                <FaEdit className="text-xs" />
                <span>Editar</span>
              </button>

              <button
                onClick={(e) => handleAdminAction('delete', e)}
                className="
                  flex-1 bg-red-600 hover:bg-red-700 
                  text-white px-3 py-2 rounded-lg text-sm font-medium 
                  transition-colors flex items-center justify-center space-x-1
                "
              >
                <FaTrash className="text-xs" />
                <span>Eliminar</span>
              </button>
            </div>
          )}

          {/* Mensaje de estado para eventos llenos o cerrados */}
          {!canRegister && !canUnregister && !isUserRegistered && (
            <div className="text-center text-sm text-gray-500 dark:text-slate-400 py-2">
              {isFull ? 'Evento lleno' : 'Inscripciones cerradas'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}