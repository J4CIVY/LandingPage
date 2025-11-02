'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3" role="region" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const icons = {
    success: <FaCheckCircle className="w-5 h-5 text-white dark:text-green-200" />, 
    error: <FaExclamationTriangle className="w-5 h-5 text-white dark:text-red-200" />, 
    warning: <FaExclamationTriangle className="w-5 h-5 text-yellow-900 dark:text-yellow-200" />, 
    info: <FaInfoCircle className="w-5 h-5 text-white dark:text-blue-200" />
  };

  const colors = {
    success: 'bg-green-500 text-white border-green-600 dark:bg-green-700 dark:text-green-100 dark:border-green-800',
    error: 'bg-red-500 text-white border-red-600 dark:bg-red-700 dark:text-red-100 dark:border-red-800',
    warning: 'bg-yellow-500 text-yellow-900 border-yellow-600 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-700',
    info: 'bg-blue-500 text-white border-blue-600 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-800'
  };

  return (
    <div
      className={`min-w-80 max-w-md p-4 rounded-lg shadow-lg border-l-4 ${colors[toast.type]} animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="shrink-0 mr-3 mt-0.5">
          {icons[toast.type]}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 ml-2 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none"
          aria-label="Cerrar notificación"
        >
          <FaTimes className="w-4 h-4 text-white dark:text-gray-200" />
        </button>
      </div>
    </div>
  );
};

// Helper hooks for common toast types
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);
};

export const useWarningToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);
};

export const useInfoToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);
};
