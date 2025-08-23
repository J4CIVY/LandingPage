import { useState, useEffect } from 'react';
import api from '@/components/api/Api';
import { Event } from '@/types/events';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get<{ status: string; data: { events: Event[] } }>('/events');
        if (response.data.status === 'success' && Array.isArray(response.data.data.events)) {
          setEvents(response.data.data.events);
        } else {
          throw new Error('Unexpected event response format.');
        }
      } catch (err: any) {
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching events:', err);
        }
        setError(err.response?.data?.message || err.message || 'Error loading events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};
