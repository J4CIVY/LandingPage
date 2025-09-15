'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';

interface EventosHeaderProps {
  isAdmin: boolean;
  onCreateEvent: () => void;
  stats?: {
    proximosEventos: number;
    registrosEnCurso: number;
    misRegistros: number;
    eventosAsistidos: number;
    totalEventos: number;
  };
  loading?: boolean;
}

export default function EventosHeader({ isAdmin, onCreateEvent, stats, loading }: EventosHeaderProps) {
  // Usar estadísticas pasadas como props o valores por defecto
  const displayStats = stats || {
    proximosEventos: 0,
    registrosEnCurso: 0,
    misRegistros: 0,
    eventosAsistidos: 0,
    totalEventos: 0
  };

  const isLoading = loading || false;

  return (
    <div className="mb-8">
      {/* Encabezado principal */}
      <div className="bg-gradient-to-r from-emerald-600 to-sky-600 rounded-xl p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-3">
              <FaCalendarAlt className="text-3xl mr-3" />
              <h1 className="text-4xl font-bold">
                Eventos BSKMT
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl">
              Participa en las actividades del motoclub y mantente siempre activo.
            </p>
            <p className="text-sm text-blue-200 mt-2">
              Descubre rodadas, talleres, charlas y mucho más. ¡La aventura te espera!
            </p>
          </div>
          
          {/* Botón crear evento - solo admin */}
          {isAdmin && (
            <div className="flex-shrink-0">
              <button
                onClick={onCreateEvent}
                className="
                  bg-white text-blue-600 hover:bg-blue-50 
                  px-6 py-3 rounded-lg font-semibold 
                  flex items-center space-x-2 
                  transition-all duration-200 
                  shadow-lg hover:shadow-xl
                  transform hover:scale-105
                "
              >
                <FaPlus className="text-lg" />
                <span>Crear Evento</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLoading ? '...' : displayStats.proximosEventos}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Próximos Eventos
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isLoading ? '...' : displayStats.registrosEnCurso}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Registros En Curso
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {isLoading ? '...' : displayStats.misRegistros}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Mis Registros
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isLoading ? '...' : displayStats.eventosAsistidos}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Eventos Asistidos
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-slate-400">
              {isLoading ? '...' : displayStats.totalEventos}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Total de Eventos
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              ¡Mantente activo en el motoclub!
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Inscríbete en eventos, conoce nuevos lugares y comparte experiencias únicas con otros motociclistas. 
              Recuerda revisar los requisitos y fechas límite de inscripción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}