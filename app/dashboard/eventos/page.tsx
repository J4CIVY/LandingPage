'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import EventosHeader from '@/components/eventos/EventosHeader';
import EventosFilter from '@/components/eventos/EventosFilter';
import EventoCard from '@/components/eventos/EventoCard';
import EventoModal from '@/components/eventos/EventoModal';
import EventoForm from '@/components/eventos/EventoForm';
import { Event, EventFilters, CreateEventData } from '@/types/events';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function EventosPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { events, loading, error, refetch } = useEvents();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    eventType: 'all',
    status: 'all',
    location: '',
    myEvents: false
  });

  // Verificar autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-8 w-8 text-red-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  // Función para determinar el estado de visualización de un evento
  const getEventDisplayStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    
    if (endDate < now) {
      return 'finished';
    } else if (startDate <= now && endDate >= now) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  };

  // Función para calcular estadísticas de eventos
  const calculateEventStats = () => {
    if (!events || !user) return {
      proximosEventos: 0,
      registrosEnCurso: 0,
      misRegistros: 0,
      eventosAsistidos: 0,
      totalEventos: 0
    };

    const now = new Date();
    const next90Days = new Date();
    next90Days.setDate(now.getDate() + 90);

    // 1. Próximos Eventos (en los próximos 90 días)
    const proximosEventos = events.filter(event => {
      const startDate = new Date(event.startDate);
      return startDate >= now && startDate <= next90Days;
    }).length;

    // 2. Registros en Curso (eventos que están abiertos a registro)
    const registrosEnCurso = events.filter(event => {
      const now = new Date();
      const startDate = new Date(event.startDate);
      const registrationDeadline = event.registrationDeadline ? 
        new Date(event.registrationDeadline) : startDate;
      
      return startDate > now && // Evento no ha empezado
             registrationDeadline > now && // Registro aún abierto
             (!event.maxParticipants || event.currentParticipants < event.maxParticipants); // No está lleno
    }).length;

    // 3. Mis Registros (eventos actuales del usuario - no incluye pasados)
    const misRegistros = events.filter(event => {
      const startDate = new Date(event.startDate);
      const userId = user._id?.toString() || '';
      return event.participants?.includes(userId) && startDate >= now;
    }).length;

    // 4. Eventos Asistidos (total de eventos que el usuario ha asistido)
    const eventosAsistidos = events.filter(event => {
      const userId = user._id?.toString() || '';
      return event.attendedParticipants?.includes(userId);
    }).length;

    // 5. Total de Eventos organizados por el club
    const totalEventos = events.length;

    return {
      proximosEventos,
      registrosEnCurso,
      misRegistros,
      eventosAsistidos,
      totalEventos
    };
  };

  // Calcular estadísticas
  const stats = calculateEventStats();

  // Filtrar eventos según los filtros aplicados
  const filteredEvents = events.filter(event => {
    const userId = user?._id?.toString() || '';
    
    // Filtro de búsqueda por nombre
    if (filters.search && !event.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filtro por tipo de evento
    if (filters.eventType !== 'all' && event.eventType !== filters.eventType) {
      return false;
    }
    
    // Filtro por estado del evento
    if (filters.status !== 'all') {
      const displayStatus = getEventDisplayStatus(event);
      if (displayStatus !== filters.status) {
        return false;
      }
    }
    
    // Filtro por ubicación
    if (filters.location && event.departureLocation && 
        !event.departureLocation.address.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filtro "Mis Eventos" - solo eventos donde el usuario está registrado
    if (filters.myEvents) {
      if (!event.participants?.includes(userId)) {
        return false;
      }
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      const eventDate = new Date(event.startDate);
      const filterDate = new Date(filters.dateFrom);
      if (eventDate < filterDate) {
        return false;
      }
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const eventDate = new Date(event.startDate);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999); // Incluir todo el día
      if (eventDate > filterDate) {
        return false;
      }
    }

    // Filtro por dificultad
    if (filters.difficulty && filters.difficulty !== 'all') {
      if (event.difficulty !== filters.difficulty) {
        return false;
      }
    }
    
    return true;
  });

  // Handlers para los eventos
  const handleViewEvent = (event: Event) => {
    // Redirigir a la página de detalles del evento en el dashboard
    window.location.href = `/dashboard/events/${event._id}`;
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        const apiClient = (await import('@/lib/api-client')).default;
        await apiClient.delete(`/events/${eventId}`);
        await refetch();
      } catch (error) {
        console.error('Error al eliminar evento:', error);
      }
    }
  };

  const handleRegisterToEvent = async (eventId: string) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post(`/events/${eventId}/register`, {});
      await refetch();
    } catch (error) {
      console.error('Error al registrarse al evento:', error);
    }
  };

  const handleUnregisterFromEvent = async (eventId: string) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.delete(`/events/${eventId}/register`);
      await refetch();
      alert('Registro cancelado exitosamente');
    } catch (error) {
      console.error('Error al cancelar registro:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const handleEventFormSubmit = async (eventData: CreateEventData) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      
      if (editingEvent) {
        await apiClient.put(`/events/${editingEvent._id}`, eventData as unknown as Record<string, unknown>);
      } else {
        await apiClient.post('/events', eventData as unknown as Record<string, unknown>);
      }
      
      setShowEventForm(false);
      setEditingEvent(null);
      await refetch();
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <main className="container mx-auto px-4 py-8">
        {/* Header de Eventos */}
        <EventosHeader 
          isAdmin={isAdmin}
          onCreateEvent={handleCreateEvent}
          stats={stats}
          loading={loading}
        />

        {/* Filtros */}
        <EventosFilter 
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-12">
            <FaSpinner className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando eventos...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <div className="text-center py-12">
            <FaExclamationTriangle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de eventos */}
        {!loading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron eventos que coincidan con los filtros aplicados.
                </p>
                {isAdmin && (
                  <button
                    onClick={handleCreateEvent}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Crear primer evento
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventoCard
                    key={event._id}
                    event={event}
                    currentUser={user}
                    onClick={() => handleViewEvent(event)}
                    onRegister={() => handleRegisterToEvent(event._id)}
                    onUnregister={() => handleUnregisterFromEvent(event._id)}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de detalles del evento */}
      {showEventModal && selectedEvent && (
        <EventoModal
          event={selectedEvent}
          currentUser={user}
          isOpen={showEventModal}
          onClose={handleCloseModal}
          onRegister={() => handleRegisterToEvent(selectedEvent._id)}
          onUnregister={() => handleUnregisterFromEvent(selectedEvent._id)}
          onEdit={() => {
            handleCloseModal();
            handleEditEvent(selectedEvent);
          }}
          onDelete={() => {
            handleCloseModal();
            void handleDeleteEvent(selectedEvent._id);
          }}
        />
      )}

      {/* Modal del formulario de evento */}
      {showEventForm && (
        <EventoForm
          event={editingEvent}
          isOpen={showEventForm}
          onClose={handleCloseForm}
          onSave={handleEventFormSubmit}
        />
      )}
    </div>
  );
}