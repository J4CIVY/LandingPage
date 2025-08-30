import { useState, useEffect } from 'react';
import { Event } from '@/types/events';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Set empty events array since external API is removed
        setEvents([]);
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
