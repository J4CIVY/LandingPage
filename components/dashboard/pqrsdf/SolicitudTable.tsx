'use client';

import { Solicitud, ESTADOS_SOLICITUD, COLORES_ESTADO, CATEGORIAS_SOLICITUD } from '@/types/pqrsdf';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

interface SolicitudTableProps {
  solicitudes: Solicitud[];
  className?: string;
}

type SortField = 'numeroSolicitud' | 'categoria' | 'estado' | 'fechaCreacion' | 'fechaActualizacion';
type SortDirection = 'asc' | 'desc';

export default function SolicitudTable({ solicitudes, className = '' }: SolicitudTableProps) {
  const [sortField, setSortField] = useState<SortField>('fechaCreacion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSolicitudes = [...solicitudes].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valueA: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valueB: any;

    switch (sortField) {
      case 'numeroSolicitud':
        valueA = a.numeroSolicitud;
        valueB = b.numeroSolicitud;
        break;
      case 'categoria':
        valueA = CATEGORIAS_SOLICITUD[a.categoria];
        valueB = CATEGORIAS_SOLICITUD[b.categoria];
        break;
      case 'estado':
        valueA = ESTADOS_SOLICITUD[a.estado];
        valueB = ESTADOS_SOLICITUD[b.estado];
        break;
      case 'fechaCreacion':
        valueA = new Date(a.fechaCreacion).getTime();
        valueB = new Date(b.fechaCreacion).getTime();
        break;
      case 'fechaActualizacion':
        valueA = new Date(a.fechaActualizacion).getTime();
        valueB = new Date(b.fechaActualizacion).getTime();
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-blue-600" />
      : <FaSortDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Tabla para desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                onClick={() => handleSort('numeroSolicitud')}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  {getSortIcon('numeroSolicitud')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                onClick={() => handleSort('categoria')}
              >
                <div className="flex items-center space-x-1">
                  <span>Categoría</span>
                  {getSortIcon('categoria')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Asunto
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                onClick={() => handleSort('estado')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  {getSortIcon('estado')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                onClick={() => handleSort('fechaCreacion')}
              >
                <div className="flex items-center space-x-1">
                  <span>Creada</span>
                  {getSortIcon('fechaCreacion')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                onClick={() => handleSort('fechaActualizacion')}
              >
                <div className="flex items-center space-x-1">
                  <span>Actualizada</span>
                  {getSortIcon('fechaActualizacion')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {sortedSolicitudes.map((solicitud) => (
              <tr key={solicitud.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                  {solicitud.numeroSolicitud}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                  {CATEGORIAS_SOLICITUD[solicitud.categoria]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 max-w-xs truncate">
                  {solicitud.asunto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${COLORES_ESTADO[solicitud.estado]}`}>
                    {ESTADOS_SOLICITUD[solicitud.estado]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                  {format(new Date(solicitud.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(solicitud.fechaActualizacion), { addSuffix: true, locale: es })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/dashboard/pqrsdf/${solicitud.id}`}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaEye className="w-4 h-4" />
                    <span>Ver</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista móvil */}
      <div className="md:hidden">
        {sortedSolicitudes.map((solicitud) => (
          <div key={solicitud.id} className="p-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">
                {solicitud.numeroSolicitud}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${COLORES_ESTADO[solicitud.estado]}`}>
                {ESTADOS_SOLICITUD[solicitud.estado]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
              {CATEGORIAS_SOLICITUD[solicitud.categoria]}
            </p>
            
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
              {solicitud.asunto}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-500">
              <span>
                {format(new Date(solicitud.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
              </span>
              <Link
                href={`/dashboard/pqrsdf/${solicitud.id}`}
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <FaEye className="w-3 h-3" />
                <span>Ver</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {solicitudes.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 dark:text-slate-500 mb-2">
            <FaEye className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            No hay solicitudes
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Aún no has creado ninguna solicitud PQRSDF.
          </p>
        </div>
      )}
    </div>
  );
}
