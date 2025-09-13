'use client';

import { useEffect } from 'react';
import { Notificacion } from '@/types/puntos';

interface NotificacionesToastProps {
  notificaciones: Notificacion[];
  onEliminar: (id: string) => void;
}

export default function NotificacionesToast({ notificaciones, onEliminar }: NotificacionesToastProps) {
  const getIcono = (tipo: Notificacion['tipo']) => {
    const iconos = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return iconos[tipo];
  };

  const getColores = (tipo: Notificacion['tipo']) => {
    const colores = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
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
          className={`border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-2 fade-in-0 duration-300 ${getColores(notificacion.tipo)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-lg">{getIcono(notificacion.tipo)}</span>
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
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
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