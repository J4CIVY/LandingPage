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
      // Fetch upcoming events from the API with a reasonable limit
      const response = await fetch('/api/events?upcoming=true&limit=50');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: EventsApiResponse = await response.json();
      
      console.log('📊 API Response:', data); // Debug log
      
      if (data.success && data.data?.events) {
        console.log('✅ Events loaded:', data.data.events.length); // Debug log
        setEvents(data.data.events);
      } else {
        console.log('❌ No events found in response'); // Debug log
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
    fetchEvents();
  }, [fetchEvents]);

  // Temporalmente sin filtro de 6 meses para debug
  const upcomingEventsInSixMonths = events.filter(event => {
    const now = new Date();
    const eventDate = parseISO(event.startDate);
    
    // Solo verificar que sea futuro
    const isAfterNow = isAfter(eventDate, now);
    
    console.log('�️ Event:', event.name);
    console.log('📅 Event date:', eventDate.toISOString());
    console.log('⏰ Now:', now.toISOString());
    console.log('✅ Is after now:', isAfterNow);
    console.log('---');
    
    return isAfterNow; // Temporalmente solo filtrar por futuro
  });

  console.log('📋 Total events loaded:', events.length);
  console.log('🎯 Future events:', upcomingEventsInSixMonths.length);

  return {
    events,
    loading,
    error,
    fetchEvents,
    upcomingEventsInSixMonths
  };
};