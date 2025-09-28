'use client';

import { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaCreditCard, 
  FaGift, 
  FaFileAlt, 
  FaTrophy,
  FaFilter,
  FaChevronDown,
  FaEye,
  FaExternalLinkAlt
} from 'react-icons/fa';
import type { HistorialItem, FiltroHistorial } from '@/types/historial';

interface TimelineProps {
  items: HistorialItem[];
  filtro: FiltroHistorial;
  onFiltroChange: (filtro: FiltroHistorial) => void;
}

export default function Timeline({ items, filtro, onFiltroChange }: TimelineProps) {
  const [showFilters, setShowFilters] = useState(false);

  const categorias = [
    { value: 'Todos', label: 'Todos', icon: FaFilter, color: 'text-gray-600' },
    { value: 'Eventos', label: 'Eventos', icon: FaCalendarAlt, color: 'text-blue-600' },
    { value: 'Membresía', label: 'Membresía', icon: FaCreditCard, color: 'text-green-600' },
    { value: 'Beneficios', label: 'Beneficios', icon: FaGift, color: 'text-yellow-600' },
    { value: 'PQRSDF', label: 'PQRSDF', icon: FaFileAlt, color: 'text-orange-600' },
    { value: 'Reconocimientos', label: 'Reconocimientos', icon: FaTrophy, color: 'text-purple-600' }
  ];

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'Evento': return FaCalendarAlt;
      case 'Membresía': return FaCreditCard;
      case 'Beneficio': return FaGift;
      case 'PQRSDF': return FaFileAlt;
      case 'Reconocimiento': return FaTrophy;
      default: return FaCalendarAlt;
    }
  };

  const getColorForType = (tipo: string) => {
    switch (tipo) {
      case 'Evento': return 'bg-blue-500';
      case 'Membresía': return 'bg-green-500';
      case 'Beneficio': return 'bg-yellow-500';
      case 'PQRSDF': return 'bg-orange-500';
      case 'Reconocimiento': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoBadge = (estado?: string) => {
    if (!estado) return null;

    const badges = {
      activo: 'bg-green-100 text-green-800',
      completado: 'bg-blue-100 text-blue-800',
      cerrado: 'bg-gray-100 text-gray-800',
      vencido: 'bg-red-100 text-red-800',
      pendiente: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
  <div className="space-y-6">
      {/* Filtros */}
  <div className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Línea de Tiempo
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <FaFilter />
            <span>Filtros</span>
            <FaChevronDown className={`transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categorias.map((categoria) => {
                const IconComponent = categoria.icon;
                const isActive = filtro.categoria === categoria.value;
                
                return (
                  <button
                    key={categoria.value}
                    onClick={() => onFiltroChange({ ...filtro, categoria: categoria.value as any })}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className={`text-sm ${isActive ? 'text-blue-600' : categoria.color}`} />
                    <span className="text-sm font-medium">{categoria.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
  <div className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-gray-300 dark:text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay elementos</h3>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron elementos para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical del timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
            
            <div className="space-y-6">
              {items.map((item, index) => {
                const IconComponent = getIconForType(item.tipo);
                const colorClass = getColorForType(item.tipo);
                const date = formatDate(item.fecha);
                
                return (
                  <div key={item.id} className="relative flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Fecha (móvil) */}
                    <div className="md:hidden bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{date.day}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{date.month} {date.year}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{date.time}</div>
                      </div>
                    </div>

                    {/* Fecha (escritorio) */}
                    <div className="hidden md:block flex-shrink-0 w-20 text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{date.day}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{date.month}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{date.year}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{date.time}</div>
                    </div>

                    {/* Icono del timeline */}
                    <div className="hidden md:flex flex-shrink-0 relative">
                      <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center relative z-10 shadow-lg`}>
                        <IconComponent className="text-white text-sm" />
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {/* Icono móvil */}
                          <div className={`md:hidden w-6 h-6 ${colorClass} rounded-full flex items-center justify-center`}>
                            <IconComponent className="text-white text-xs" />
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.descripcion}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600 dark:text-gray-300">{item.tipo}</span>
                              {getEstadoBadge(item.estado)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                            <FaEye className="text-sm" />
                          </button>
                          {item.referencia && (
                            <button className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                              <FaExternalLinkAlt className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detalles adicionales */}
                      {item.detalles && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                          {item.tipo === 'Evento' && item.detalles.puntos && (
                            <div>Puntos obtenidos: <span className="font-medium">{item.detalles.puntos}</span></div>
                          )}
                          {item.tipo === 'Beneficio' && item.detalles.valorDescuento && (
                            <div>Ahorro: <span className="font-medium text-green-600 dark:text-green-400">${item.detalles.valorDescuento.toLocaleString()}</span></div>
                          )}
                          {item.tipo === 'Reconocimiento' && item.detalles.puntos && (
                            <div>Puntos: <span className="font-medium text-purple-600 dark:text-purple-400">{item.detalles.puntos}</span></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}