'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaTimes, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock,
  FaUser,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRoute,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaInfoCircle,
  FaListUl,
  FaGift,
  FaTachometerAlt,
  FaDownload
} from 'react-icons/fa';
import { Event } from '@/types/events';

interface EventoModalProps {
  event: Event;
  currentUser: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onUnregister: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventoModal({
  event,
  currentUser,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  onEdit,
  onDelete
}: EventoModalProps) {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Verificar si el usuario está inscrito
  const isUserRegistered = event.participants?.includes(currentUser?.id) || false;

  // Verificar si el usuario es admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  // Verificar si el evento está lleno
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;

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

  // Formatear fechas
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Cargar participantes (solo admin)
  const fetchParticipants = async () => {
    if (!isAdmin) return;
    
    setLoadingParticipants(true);
    try {
      const response = await fetch(`/api/events/${event._id}/participants`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.participants);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Cargar participantes cuando se abre el modal y el usuario es admin
  useEffect(() => {
    if (isOpen && isAdmin) {
      void fetchParticipants();
    }
  }, [isOpen, isAdmin]);

  // Manejar acciones
  const handleAction = async (action: 'register' | 'unregister') => {
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

  // Exportar lista de participantes
  const exportParticipants = () => {
    if (!participants.length) return;

    const csvContent = [
      ['Nombre', 'Email', 'Teléfono', 'Fecha de Inscripción'].join(','),
      ...participants.map(p => [
        `"${p.firstName} ${p.lastName}"`,
        p.email,
        p.phone || '',
        new Date(p.registrationDate).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participantes-${event.name.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startDateTime = formatDateTime(event.startDate);
  const endDateTime = event.endDate ? formatDateTime(event.endDate) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header del modal */}
        <div className="relative">
          {/* Imagen de fondo */}
          <div className="h-64 bg-linear-to-r from-blue-500 to-purple-600 relative overflow-hidden">
            {event.mainImage && (
              <Image
                src={event.mainImage}
                alt={event.name}
                fill
                className="object-cover opacity-75"
                sizes="(max-width: 1200px) 100vw, 80vw"
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
            >
              <FaTimes className="text-xl" />
            </button>
            
            {/* Información superpuesta */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${eventStatus.color}`}>
                  {eventStatus.label}
                </span>
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium">
                  {event.eventType}
                </span>
                {event.price && event.price > 0 && (
                  <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm font-medium">
                    ${event.price.toLocaleString()}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              <p className="text-lg opacity-90">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Columna izquierda - Detalles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descripción completa */}
              {event.longDescription && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Descripción
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                      {event.longDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Requisitos */}
              {event.requirements && event.requirements.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                    <FaListUl className="mr-2 text-orange-500" />
                    Requisitos
                  </h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <ul className="space-y-2">
                      {event.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheckCircle className="text-orange-500 mr-2 mt-1 shrink-0" />
                          <span className="text-gray-700 dark:text-slate-300">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Servicios incluidos */}
              {event.includedServices && event.includedServices.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                    <FaGift className="mr-2 text-green-500" />
                    Servicios Incluidos
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <ul className="space-y-2">
                      {event.includedServices.map((service, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheckCircle className="text-green-500 mr-2 mt-1 shrink-0" />
                          <span className="text-gray-700 dark:text-slate-300">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Participantes (solo admin) */}
              {isAdmin && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                      <FaUsers className="mr-2 text-purple-500" />
                      Participantes ({event.currentParticipants})
                    </h3>
                    {participants.length > 0 && (
                      <button
                        onClick={exportParticipants}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <FaDownload className="text-xs" />
                        <span>Exportar CSV</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    {loadingParticipants ? (
                      <p className="text-center text-gray-500">Cargando participantes...</p>
                    ) : participants.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded p-2">
                            <span className="font-medium text-gray-900 dark:text-slate-100">
                              {participant.firstName} {participant.lastName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {participant.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">No hay participantes inscritos</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha - Información del evento */}
            <div className="space-y-6">
              {/* Fechas y horarios */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  Fechas y Horarios
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300">Inicio:</span>
                    <p className="text-gray-600 dark:text-slate-400">{startDateTime.date}</p>
                    <p className="text-gray-600 dark:text-slate-400">{startDateTime.time}</p>
                  </div>
                  {endDateTime && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="font-medium text-gray-700 dark:text-slate-300">Fin:</span>
                      <p className="text-gray-600 dark:text-slate-400">{endDateTime.date}</p>
                      <p className="text-gray-600 dark:text-slate-400">{endDateTime.time}</p>
                    </div>
                  )}
                  {event.registrationDeadline && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="font-medium text-gray-700 dark:text-slate-300">Límite inscripción:</span>
                      <p className="text-gray-600 dark:text-slate-400">
                        {formatDateTime(event.registrationDeadline).date}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {event.departureLocation && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Ubicación de Salida
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700 dark:text-slate-300">{event.departureLocation.address}</p>
                    <p className="text-gray-600 dark:text-slate-400">
                      {event.departureLocation.city}, {event.departureLocation.country}
                    </p>
                  </div>
                </div>
              )}

              {/* Detalles adicionales */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Detalles del Evento
                </h3>
                <div className="space-y-2 text-sm">
                  {event.duration && (
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-green-500" />
                      <span>{event.duration} horas de duración</span>
                    </div>
                  )}
                  {event.distance && (
                    <div className="flex items-center">
                      <FaRoute className="mr-2 text-purple-500" />
                      <span>{event.distance} km de recorrido</span>
                    </div>
                  )}
                  {event.difficulty && (
                    <div className="flex items-center">
                      <FaTachometerAlt className="mr-2 text-orange-500" />
                      <span className="capitalize">{event.difficulty}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-blue-500" />
                    <span>
                      {event.currentParticipants}
                      {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participantes
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizador */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
                  <FaUserTie className="mr-2 text-yellow-500" />
                  Organizador
                </h3>
                <div className="text-sm space-y-2">
                  <p className="font-medium text-gray-700 dark:text-slate-300">{event.organizer.name}</p>
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-green-500" />
                    <span className="text-gray-600 dark:text-slate-400">{event.organizer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-blue-500" />
                    <span className="text-gray-600 dark:text-slate-400">{event.organizer.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botones principales */}
              {canRegister && (
                <button
                  onClick={() => handleAction('register')}
                  disabled={loading}
                  className="
                    flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 
                    text-white px-6 py-3 rounded-lg font-medium 
                    flex items-center justify-center space-x-2
                  "
                >
                  <FaUser />
                  <span>{loading ? 'Inscribiendo...' : 'Inscribirme al Evento'}</span>
                </button>
              )}

              {canUnregister && (
                <button
                  onClick={() => handleAction('unregister')}
                  disabled={loading}
                  className="
                    flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 
                    text-white px-6 py-3 rounded-lg font-medium 
                    flex items-center justify-center space-x-2
                  "
                >
                  <FaTimes />
                  <span>{loading ? 'Cancelando...' : 'Cancelar Inscripción'}</span>
                </button>
              )}

              {/* Botones de admin */}
              {isAdmin && (
                <>
                  <button
                    onClick={onEdit}
                    className="
                      bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                      font-medium flex items-center justify-center space-x-2
                    "
                  >
                    <FaEdit />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={onDelete}
                    className="
                      bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg 
                      font-medium flex items-center justify-center space-x-2
                    "
                  >
                    <FaTrash />
                    <span>Eliminar</span>
                  </button>
                </>
              )}

              {/* Mensaje de estado */}
              {!canRegister && !canUnregister && !isUserRegistered && (
                <div className="flex-1 text-center py-3">
                  <span className="text-gray-500 dark:text-slate-400">
                    {isFull ? 'Evento lleno' : 'Inscripciones cerradas'}
                  </span>
                </div>
              )}

              {isUserRegistered && (
                <div className="flex-1 text-center py-3">
                  <span className="text-green-600 dark:text-green-400 flex items-center justify-center space-x-1">
                    <FaCheckCircle />
                    <span>Ya estás inscrito en este evento</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}