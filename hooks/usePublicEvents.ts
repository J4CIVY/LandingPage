import { useState, useEffect, useCallback } from 'react';
import { parseISO, isAfter, isBefore, addMonths } from 'date-fns';

interface Event {
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
}

interface EventsApiResponse {
  success: boolean;
  data: {
    events: Event[];
  };
}

interface UsePublicEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  upcomingEventsInSixMonths: Event[];
}

/**
 * Hook para manejar los eventos públicos de los próximos 6 meses
 */
export const usePublicEvents = (): UsePublicEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch events from the API with 6-month filter for upcoming events
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  // Obtiene eventos próximos desde la API (mantener si hay contexto útil)
      const response = await fetch('/api/events?upcoming=true&limit=50');
      
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const data: EventsApiResponse = await response.json();
      
      if (data.success && data.data?.events) {
        setEvents(data.data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError("Error al cargar los eventos. Intenta nuevamente.");
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // Filtra eventos para mostrar solo los próximos 6 meses (mantener si hay contexto útil)
  const upcomingEventsInSixMonths = events.filter(event => {
    const now = new Date();
    const sixMonthsFromNow = addMonths(now, 6);
    const eventDate = parseISO(event.startDate);
    
    return isAfter(eventDate, now) && isBefore(eventDate, sixMonthsFromNow);
  });

  return {
    events,
    loading,
    error,
    fetchEvents,
    upcomingEventsInSixMonths
  };
};