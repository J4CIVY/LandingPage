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

  // Filter events to show only those within the next 6 months
  const upcomingEventsInSixMonths = events.filter(event => {
    const now = new Date();
    const sixMonthsFromNow = addMonths(now, 6);
    const eventDate = parseISO(event.startDate);
    
    // Debug logs
    console.log('🗓️ Event:', event.name);
    console.log('📅 Event date:', eventDate);
    console.log('⏰ Now:', now);
    console.log('📆 Six months from now:', sixMonthsFromNow);
    console.log('✅ Is after now:', isAfter(eventDate, now));
    console.log('✅ Is before 6 months:', isBefore(eventDate, sixMonthsFromNow));
    
    const isUpcoming = isAfter(eventDate, now) && isBefore(eventDate, sixMonthsFromNow);
    console.log('🎯 Final result:', isUpcoming);
    
    return isUpcoming;
  });

  console.log('📋 Total events:', events.length);
  console.log('🎯 Filtered events (6 months):', upcomingEventsInSixMonths.length);

  return {
    events,
    loading,
    error,
    fetchEvents,
    upcomingEventsInSixMonths
  };
};