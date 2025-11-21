'use client';

import { TimelineEvento } from '@/types/pqrsdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FaPlus, 
  FaEdit, 
  FaCheck, 
  FaExclamationTriangle, 
  FaComments,
  FaClock
} from 'react-icons/fa';

interface TimelineProps {
  eventos: TimelineEvento[];
  className?: string;
}

const ICONOS_TIMELINE = {
  creada: { icon: FaPlus, color: 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900' },
  actualizada: { icon: FaEdit, color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900' },
  respondida: { icon: FaComments, color: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900' },
  cerrada: { icon: FaCheck, color: 'text-gray-600 bg-gray-100 dark:text-slate-300 dark:bg-slate-700' },
  escalada: { icon: FaExclamationTriangle, color: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900' },
  mensaje: { icon: FaComments, color: 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900' }
};

export default function Timeline({ eventos, className = '' }: TimelineProps) {
  // Ordenar eventos por fecha (más reciente primero)
  const eventosOrdenados = [...eventos].sort((a, b) => 
    b.fecha.getTime() - a.fecha.getTime()
  );

  if (eventos.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="flex items-center justify-center text-gray-400 dark:text-slate-500">
          <FaClock className="w-8 h-8 mr-3" />
          <span className="text-gray-600 dark:text-slate-300">No hay eventos en el timeline</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
        Timeline de Seguimiento
      </h3>
      <div className="space-y-4">
        {eventosOrdenados.map((evento, index) => {
          const IconComponent = ICONOS_TIMELINE[evento.tipo]?.icon || FaClock;
          const iconColor = ICONOS_TIMELINE[evento.tipo]?.color || 'text-gray-600 bg-gray-100 dark:text-slate-300 dark:bg-slate-700';
          return (
            <div key={evento.id} className="flex items-start space-x-3 relative">
              {/* Icono */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {evento.descripcion}
                  </p>
                  <time className="text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2">
                    {format(evento.fecha, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </time>
                </div>
                {evento.autorNombre && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Por: {evento.autorNombre}
                  </p>
                )}
                {evento.metadata && Object.keys(evento.metadata).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-slate-400">
                    {Object.entries(evento.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Línea conectora (excepto para el último elemento) */}
              {index < eventosOrdenados.length - 1 && (
                <div className="absolute left-[42px] mt-8 w-0.5 h-4 bg-gray-200 dark:bg-slate-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
