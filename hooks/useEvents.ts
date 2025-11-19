import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/events';
import apiClient from '@/lib/api-client';

export const useEvents = (upcoming = false, limit = 10) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      
      // Use NestJS endpoint: GET /events or GET /events/upcoming
      const endpoint = upcoming 
        ? `/events/upcoming?${params.toString()}`
        : `/events?${params.toString()}`;
      
      const data = await apiClient.get<Event[]>(endpoint);
      
      // NestJS returns array directly
      setEvents(Array.isArray(data) ? data : []);
      
    } catch (err: unknown) {
      console.error('❌ useEvents: Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión al cargar eventos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [upcoming, limit]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};
