'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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

  // Filtrar eventos según los filtros aplicados
  const filteredEvents = events.filter(event => {
    if (filters.search && !event.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.eventType !== 'all' && event.eventType !== filters.eventType) {
      return false;
    }
    if (filters.status !== 'all') {
      const displayStatus = getEventDisplayStatus(event);
      if (displayStatus !== filters.status) {
        return false;
      }
    }
    if (filters.location && event.departureLocation && 
        !event.departureLocation.address.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Handlers para los eventos
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
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
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          await refetch();
        } else {
          console.error('Error al eliminar evento');
        }
      } catch (error) {
        console.error('Error al eliminar evento:', error);
      }
    }
  };

  const handleRegisterToEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        await refetch();
      } else {
        console.error('Error al registrarse al evento');
      }
    } catch (error) {
      console.error('Error al registrarse al evento:', error);
    }
  };

  const handleUnregisterFromEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/unregister`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        await refetch();
      } else {
        console.error('Error al cancelar registro');
      }
    } catch (error) {
      console.error('Error al cancelar registro:', error);
    }
  };

  const handleEventFormSubmit = async (eventData: CreateEventData) => {
    try {
      const url = editingEvent ? `/api/events/${editingEvent._id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        setShowEventForm(false);
        setEditingEvent(null);
        await refetch();
      } else {
        console.error('Error al guardar evento');
      }
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

  const handleClearFilters = () => {
    setFilters({
      search: '',
      eventType: 'all',
      status: 'all',
      location: '',
      myEvents: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header de Eventos */}
        <EventosHeader 
          isAdmin={isAdmin}
          onCreateEvent={handleCreateEvent}
        />

        {/* Filtros */}
        <EventosFilter 
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
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
            handleDeleteEvent(selectedEvent._id);
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