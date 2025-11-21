'use client';

import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaUser,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import { EventFilters, EventType, EventDifficulty, EventDisplayStatus } from '@/types/events';

interface EventosFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  loading: boolean;
}

const eventTypes: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'Rally', label: 'Rally' },
  { value: 'Taller', label: 'Taller' },
  { value: 'Charla', label: 'Charla' },
  { value: 'Rodada', label: 'Rodada' },
  { value: 'Concentración', label: 'Concentración' },
  { value: 'Competencia', label: 'Competencia' },
  { value: 'Social', label: 'Evento Social' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Turismo', label: 'Turismo' },
  { value: 'Beneficencia', label: 'Beneficencia' }
];

const eventStatuses: { value: EventDisplayStatus; label: string; color: string }[] = [
  { value: 'upcoming', label: 'Próximos', color: 'text-green-600' },
  { value: 'ongoing', label: 'En curso', color: 'text-blue-600' },
  { value: 'finished', label: 'Finalizados', color: 'text-gray-600' },
  { value: 'all', label: 'Todos', color: 'text-purple-600' }
];

const difficulties: { value: EventDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas las dificultades' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'expert', label: 'Experto' }
];

export default function EventosFilter({ filters, onFiltersChange, loading }: EventosFilterProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters with debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, localFilters.search !== filters.search ? 500 : 0);

    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange, filters.search]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: keyof EventFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const clearedFilters: EventFilters = {
      search: '',
      eventType: 'all',
      status: 'upcoming',
      location: '',
      myEvents: false,
      difficulty: 'all'
    };
    setLocalFilters(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.search !== '' ||
    localFilters.eventType !== 'all' ||
    localFilters.status !== 'upcoming' ||
    localFilters.location !== '' ||
    localFilters.myEvents ||
    localFilters.difficulty !== 'all' ||
    localFilters.dateFrom ||
    localFilters.dateTo;

  return (
    <div className="bg-gray-50 dark:bg-slate-950 rounded-lg shadow-md p-6 mb-6">
      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Búsqueda */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={localFilters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="
              w-full pl-10 pr-4 py-2 
              border border-gray-300 dark:border-slate-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-slate-700 
              text-gray-900 dark:text-slate-100
              placeholder-gray-500 dark:placeholder-slate-400
            "
            disabled={loading}
          />
        </div>

        {/* Tipo de evento */}
        <div className="relative">
          <select
            value={localFilters.eventType}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="
              w-full px-4 py-2 
              border border-gray-300 dark:border-slate-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-slate-700 
              text-gray-900 dark:text-slate-100
              appearance-none cursor-pointer
            "
            disabled={loading}
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        </div>

        {/* Estado */}
        <div className="relative">
          <select
            value={localFilters.status}
            onChange={(e) => updateFilter('status', e.target.value as EventDisplayStatus)}
            className="
              w-full px-4 py-2 
              border border-gray-300 dark:border-slate-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white dark:bg-slate-700 
              text-gray-900 dark:text-slate-100
              appearance-none cursor-pointer
            "
            disabled={loading}
          >
            {eventStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        </div>

        {/* Mis eventos toggle */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.myEvents}
              onChange={(e) => updateFilter('myEvents', e.target.checked)}
              className="
                w-4 h-4 text-blue-600 bg-gray-100 dark:bg-slate-700 
                border-gray-300 dark:border-slate-600 rounded 
                focus:ring-blue-500 focus:ring-2
              "
              disabled={loading}
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <FaUser className="inline mr-1" />
              Mis eventos
            </span>
          </label>
        </div>
      </div>

      {/* Botón filtros avanzados */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="
            flex items-center space-x-2 text-blue-600 dark:text-blue-400 
            hover:text-blue-800 dark:hover:text-blue-300 
            font-medium text-sm
          "
          disabled={loading}
        >
          <FaFilter className="text-sm text-blue-600 dark:text-blue-400" />
          <span>Filtros avanzados</span>
          <FaChevronDown 
            className={`text-sm ${showAdvancedFilters ? 'rotate-180' : ''} text-blue-600 dark:text-blue-400`} 
          />
        </button>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="
              flex items-center space-x-2 text-red-600 dark:text-red-400 
              hover:text-red-800 dark:hover:text-red-300 
              font-medium text-sm
            "
            disabled={loading}
          >
            <FaTimes className="text-sm text-red-600 dark:text-red-400" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ubicación */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Ubicación..."
                value={localFilters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 
                  border border-gray-300 dark:border-slate-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-slate-700 
                  text-gray-900 dark:text-slate-100
                  placeholder-gray-500 dark:placeholder-slate-400
                "
                disabled={loading}
              />
            </div>

            {/* Dificultad */}
            <div className="relative">
              <select
                value={localFilters.difficulty || 'all'}
                onChange={(e) => updateFilter('difficulty', e.target.value === 'all' ? undefined : e.target.value)}
                className="
                  w-full px-4 py-2 
                  border border-gray-300 dark:border-slate-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-slate-700 
                  text-gray-900 dark:text-slate-100
                  appearance-none cursor-pointer
                "
                disabled={loading}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            </div>

            {/* Fecha desde */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="date"
                placeholder="Fecha desde"
                value={localFilters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                className="
                  w-full pl-10 pr-4 py-2 
                  border border-gray-300 dark:border-slate-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-slate-700 
                  text-gray-900 dark:text-slate-100
                "
                disabled={loading}
              />
            </div>

            {/* Fecha hasta */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="date"
                placeholder="Fecha hasta"
                value={localFilters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                min={localFilters.dateFrom}
                className="
                  w-full pl-10 pr-4 py-2 
                  border border-gray-300 dark:border-slate-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-slate-700 
                  text-gray-900 dark:text-slate-100
                "
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-400 mr-2">Filtros activos:</span>
            
            {localFilters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Búsqueda: "{localFilters.search}"
              </span>
            )}
            
            {localFilters.eventType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Tipo: {eventTypes.find(t => t.value === localFilters.eventType)?.label}
              </span>
            )}
            
            {localFilters.status !== 'upcoming' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Estado: {eventStatuses.find(s => s.value === localFilters.status)?.label}
              </span>
            )}
            
            {localFilters.myEvents && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                Mis eventos
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
