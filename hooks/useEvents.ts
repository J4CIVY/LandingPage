import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/events';

export const useEvents = (upcoming = false, limit = 10) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (upcoming) params.append('upcoming', 'true');
      if (limit) params.append('limit', limit.toString());
      
      console.log('🔍 useEvents: Fetching events with params:', params.toString());
      
      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();
      
      console.log('📋 useEvents: Response data:', data);
      
      if (response.ok) {
        const eventsArray = data.data?.events || [];
        console.log('✅ useEvents: Events array:', eventsArray);
        setEvents(eventsArray);
      } else {
        console.error('❌ useEvents: Error response:', data);
        setError(data.message || 'Error al cargar eventos');
      }
    } catch (err: any) {
      console.error('❌ useEvents: Fetch error:', err);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching events:', err);
      }
      setError(err.message || 'Error de conexión al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, [upcoming, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};
