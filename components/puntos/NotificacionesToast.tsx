'use client';

import { useEffect } from 'react';
import { Notificacion } from '@/types/puntos';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaInfoCircle 
} from 'react-icons/fa';

interface NotificacionesToastProps {
  notificaciones: Notificacion[];
  onEliminar: (id: string) => void;
}

export default function NotificacionesToast({ notificaciones, onEliminar }: NotificacionesToastProps) {
  const getIcono = (tipo: Notificacion['tipo']) => {
    const iconos = {
      success: <FaCheckCircle className="text-green-600 dark:text-green-400" />,
      error: <FaTimesCircle className="text-red-600 dark:text-red-400" />,
      warning: <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />,
      info: <FaInfoCircle className="text-blue-600 dark:text-blue-400" />
    };
    return iconos[tipo];
  };

  const getColores = (tipo: Notificacion['tipo']) => {
    const colores = {
      success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
      info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
    };
    return colores[tipo];
  };

  if (notificaciones.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notificaciones.map((notificacion) => (
        <div
          key={notificacion.id}
          className={`border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-2 fade-in-0 ${getColores(notificacion.tipo)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-lg">{getIcono(notificacion.tipo)}</div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {notificacion.titulo}
                </h4>
                <p className="text-sm opacity-90 mt-1">
                  {notificacion.mensaje}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onEliminar(notificacion.id)}
              className="ml-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white focus:outline-none"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}