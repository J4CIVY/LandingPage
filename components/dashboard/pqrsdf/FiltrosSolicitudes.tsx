'use client';

import { FiltroSolicitudes, CATEGORIAS_SOLICITUD, ESTADOS_SOLICITUD } from '@/types/pqrsdf';
import { useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

interface FiltrosSolicitudesProps {
  filtros: FiltroSolicitudes;
  onFiltrosChange: (filtros: FiltroSolicitudes) => void;
  className?: string;
}

export default function FiltrosSolicitudes({ 
  filtros, 
  onFiltrosChange, 
  className = '' 
}: FiltrosSolicitudesProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const actualizarFiltro = (campo: keyof FiltroSolicitudes, valor: any) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor || undefined
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({});
  };

  const hayFiltrosActivos = Object.values(filtros).some(valor => 
    valor !== undefined && valor !== ''
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}>
      {/* Header con búsqueda y toggle de filtros */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar solicitudes..."
              value={filtros.busqueda || ''}
              onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4 mr-1" />
                Limpiar
              </button>
            )}
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-lg transition-colors duration-200 ${
                mostrarFiltros || hayFiltrosActivos
                  ? 'text-blue-600 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:bg-blue-900/20'
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-700'
              }`}
            >
              <FaFilter className="w-4 h-4 mr-1" />
              Filtros
              {hayFiltrosActivos && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {Object.values(filtros).filter(v => v !== undefined && v !== '').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {mostrarFiltros && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-700">
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={filtros.categoria || ''}
                onChange={(e) => actualizarFiltro('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Todas las categorías</option>
                {Object.entries(CATEGORIAS_SOLICITUD).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => actualizarFiltro('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADOS_SOLICITUD).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde ? filtros.fechaDesde.toISOString().split('T')[0] : ''}
                onChange={(e) => actualizarFiltro('fechaDesde', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta ? filtros.fechaHasta.toISOString().split('T')[0] : ''}
                onChange={(e) => actualizarFiltro('fechaHasta', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}