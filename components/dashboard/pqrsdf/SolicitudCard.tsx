'use client';

import { Solicitud, ESTADOS_SOLICITUD, COLORES_ESTADO, ICONOS_CATEGORIA } from '@/types/pqrsdf';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaEye, FaClock, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

interface SolicitudCardProps {
  solicitud: Solicitud;
  className?: string;
}

export default function SolicitudCard({ solicitud, className = '' }: SolicitudCardProps) {
  return (
  <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md ${className}`}>
      {/* Header con número y estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {ICONOS_CATEGORIA[solicitud.categoria]}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
            {solicitud.numeroSolicitud}
          </h3>
        </div>
  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${COLORES_ESTADO[solicitud.estado]}`}>
          {ESTADOS_SOLICITUD[solicitud.estado]}
        </span>
      </div>

      {/* Asunto */}
      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
        {solicitud.asunto}
      </h4>

      {/* Descripción */}
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
        {solicitud.descripcion}
      </p>

      {/* Info adicional */}
      <div className="flex flex-col space-y-2 text-xs text-gray-500 dark:text-slate-500">
        <div className="flex items-center space-x-1">
          <FaCalendarAlt className="w-3 h-3" />
          <span>Creada {formatDistanceToNow(new Date(solicitud.fechaCreacion), { addSuffix: true, locale: es })}</span>
        </div>
        
        {solicitud.fechaActualizacion !== solicitud.fechaCreacion && (
          <div className="flex items-center space-x-1">
            <FaClock className="w-3 h-3" />
            <span>Actualizada {formatDistanceToNow(new Date(solicitud.fechaActualizacion), { addSuffix: true, locale: es })}</span>
          </div>
        )}
        
        {solicitud.mensajes.length > 0 && (
          <div className="text-blue-600 dark:text-blue-400">
            {solicitud.mensajes.length} mensaje{solicitud.mensajes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Botón ver detalles */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600">
        <Link
          href={`/dashboard/pqrsdf/${solicitud.id}`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FaEye className="w-4 h-4" />
          <span>Ver Detalles</span>
        </Link>
      </div>
    </div>
  );
}