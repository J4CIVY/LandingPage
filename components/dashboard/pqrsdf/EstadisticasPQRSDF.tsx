'use client';

import { EstadisticasSolicitudes } from '@/types/pqrsdf';
import { 
  FaFileAlt, 
  FaClock, 
  FaCheck, 
  FaComments,
  FaChartBar,
  FaStar
} from 'react-icons/fa';

interface EstadisticasPQRSDFProps {
  estadisticas: EstadisticasSolicitudes;
  className?: string;
}

export default function EstadisticasPQRSDF({ estadisticas, className = '' }: EstadisticasPQRSDFProps) {
  const totalActivas = estadisticas.porEstado.en_revision + estadisticas.porEstado.escalada;
  const porcentajeResueltas = estadisticas.total > 0 
    ? Math.round(((estadisticas.porEstado.respondida + estadisticas.porEstado.cerrada) / estadisticas.total) * 100)
    : 0;

  return (
  <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Estadísticas PQRSDF
        </h3>
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FaChartBar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {estadisticas.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Total Solicitudes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {porcentajeResueltas}%
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Resueltas
            </div>
          </div>
        </div>

        {/* Estados */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            Por Estado
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-600 dark:text-slate-400">En Revisión</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {estadisticas.porEstado.en_revision}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FaComments className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-600 dark:text-slate-400">Respondidas</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {estadisticas.porEstado.respondida}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FaCheck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-slate-400">Cerradas</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {estadisticas.porEstado.cerrada}
              </span>
            </div>
            
            {estadisticas.porEstado.escalada > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <FaFileAlt className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-600 dark:text-slate-400">Escaladas</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {estadisticas.porEstado.escalada}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Métricas adicionales */}
  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-600 dark:text-slate-400">Tiempo Promedio</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {estadisticas.tiempoPromedioRespuesta}h
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FaStar className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                <span className="text-gray-600 dark:text-slate-400">Satisfacción</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {estadisticas.satisfaccionPromedio.toFixed(1)}/5
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de actividad */}
        {totalActivas > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaClock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Tienes {totalActivas} solicitud{totalActivas !== 1 ? 'es' : ''} activa{totalActivas !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
