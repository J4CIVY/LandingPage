'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  _id: string;
  type: 'event_upcoming' | 'event_registration_open' | 'event_reminder' | 'membership_update' | 'system_announcement';
  title: string;
  message: string;
  data?: {
    eventId?: string;
    eventName?: string;
    eventDate?: string;
    url?: string;
    [key: string]: any;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (options?: { unreadOnly?: boolean; limit?: number; page?: number }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (options: { unreadOnly?: boolean; limit?: number; page?: number } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar notificaciones');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
  // Actualiza el estado local
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        
  // Disminuye el conteo de no leídas
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al marcar como leída');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      setError('Error de conexión');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
  // Marca todas como leídas en el estado local
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date().toISOString()
          }))
        );
        
  // Resetea conteo de no leídas
        setUnreadCount(0);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al marcar todas como leídas');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Error de conexión');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
  // Remueve del estado local
        const notificationToDelete = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        
  // Si era no leída, disminuye el conteo
        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al eliminar notificación');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Error de conexión');
    }
  }, [notifications]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true&limit=1', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  }, []);

  // Carga notificaciones iniciales
  useEffect(() => {
    fetchNotifications({ limit: 10 });
  }, [fetchNotifications]);

  // Polling para actualizar el conteo cada 30 segundos (mantener si hay contexto útil)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadCount();
  }, 30000);

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount
  };
}
