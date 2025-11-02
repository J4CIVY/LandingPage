'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  FaBell,
  FaSpinner,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMedal,
  FaCheckDouble,
  FaEye
} from 'react-icons/fa';

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
    [key: string]: unknown;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    fetchNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Si tiene URL, navegar
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClasses = `text-lg ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    switch (type) {
      case 'event_upcoming':
      case 'event_reminder':
        return <FaCalendarAlt className={iconClasses} />;
      case 'event_registration_open':
        return <FaExclamationTriangle className={iconClasses} />;
      case 'membership_update':
        return <FaMedal className={iconClasses} />;
      case 'system_announcement':
        return <FaInfoCircle className={iconClasses} />;
      default:
        return <FaBell className={iconClasses} />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 2592000)}mes`;
  };

  const visibleNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className={`relative ${className}`}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-lg"
      >
        <FaBell className="text-lg sm:text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-20 max-h-96 sm:max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Notificaciones
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                    title="Marcar todas como leídas"
                  >
                    <FaCheckDouble className="mr-1" />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <FaSpinner className="animate-spin text-2xl text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-slate-400">Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                  <button
                    onClick={() => fetchNotifications()}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Reintentar
                  </button>
                </div>
              ) : visibleNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaBell className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {visibleNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead 
                                  ? 'text-gray-900 dark:text-slate-100' 
                                  : 'text-gray-700 dark:text-slate-300'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 dark:text-slate-500">
                                  {getRelativeTime(notification.createdAt)}
                                </span>
                                {!notification.isRead && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    Nuevo
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void markAsRead(notification._id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Marcar como leída"
                                >
                                  <FaEye className="text-xs" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void deleteNotification(notification._id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Eliminar"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && !error && notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-slate-700">
                {notifications.length > 5 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-center"
                  >
                    Ver todas las notificaciones ({notifications.length})
                  </button>
                )}
                {showAll && (
                  <button
                    onClick={() => setShowAll(false)}
                    className="w-full text-sm text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-center"
                  >
                    Mostrar menos
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
