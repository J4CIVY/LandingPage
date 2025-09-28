'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaFire, 
  FaThumbsUp, 
  FaDumbbell 
} from 'react-icons/fa';

interface ActividadSemanal {
  dia: string;
  puntos: number;
  actividades: number;
}

interface ResumenSemanalProps {
  usuarioId: string;
}

export default function ResumenSemanal({ usuarioId }: ResumenSemanalProps) {
  const [actividades, setActividades] = useState<ActividadSemanal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarResumenSemanal = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/users/weekly-activity');
        if (response.ok) {
          const data = await response.json();
          setActividades(data.actividadSemanal);
        } else {
          console.error('Error al obtener actividad semanal:', response.statusText);
          // Fallback a datos vacíos en caso de error
          setActividades([]);
        }
      } catch (error) {
        console.error('Error al cargar actividad semanal:', error);
        // Fallback a datos vacíos en caso de error
        setActividades([]);
      } finally {
        setLoading(false);
      }
    };

    cargarResumenSemanal();
  }, [usuarioId]);

  const maxPuntos = actividades && actividades.length > 0 ? Math.max(...actividades.map(a => a.puntos)) : 0;
  const totalPuntosSemana = actividades ? actividades.reduce((sum, a) => sum + a.puntos, 0) : 0;
  const totalActividadesSemana = actividades ? actividades.reduce((sum, a) => sum + a.actividades, 0) : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-500 dark:text-blue-400" />
          Actividad Semanal
        </h3>
        <div className="animate-pulse">
          <div className="flex justify-between items-end h-32 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="flex-1 bg-gray-200 dark:bg-slate-700 rounded" style={{ height: `${Math.random() * 100 + 20}px` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <FaChartLine className="text-blue-500 dark:text-blue-400" />
        Actividad de esta Semana
      </h3>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPuntosSemana}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">Puntos ganados</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActividadesSemana}</p>
          <p className="text-sm text-green-700 dark:text-green-300">Actividades</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="mb-4">
        <div className="flex justify-between items-end h-32 gap-2">
          {actividades && actividades.length > 0 ? actividades.map((actividad, index) => {
            const altura = maxPuntos > 0 ? (actividad.puntos / maxPuntos) * 100 : 0;
            const esHoy = index === actividades.length - 1;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* Barra */}
                <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
                  <div
                    className={`w-full rounded-t ${
                      esHoy 
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-700 dark:to-blue-400' 
                        : 'bg-gradient-to-t from-gray-300 to-gray-200 dark:from-slate-700 dark:to-slate-800'
                    }`}
                    style={{ height: `${altura}%` }}
                  />
                  
                  {/* Valor de puntos */}
                  {actividad.puntos > 0 && (
                    <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                      esHoy ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {actividad.puntos}
                    </div>
                  )}
                </div>
                
                {/* Día */}
                <p className={`text-xs mt-2 font-medium ${
                  esHoy ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                }`}>
                  {actividad.dia}
                </p>
                
                {/* Indicador de actividades */}
                {actividad.actividades > 0 && (
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: actividad.actividades }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          esHoy ? 'bg-blue-400 dark:bg-blue-600' : 'bg-gray-400 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="flex-1 text-center text-gray-500 dark:text-gray-300 py-8">
              <p className="text-sm">No hay datos de actividad disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
  <div className="text-xs text-gray-500 dark:text-gray-300 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-700 dark:to-blue-400 rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-gray-400 dark:bg-slate-700 rounded-full"></div>
          <span>• = 1 actividad</span>
        </div>
      </div>

      {/* Motivación */}
      {totalPuntosSemana > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-300 text-center flex items-center justify-center gap-2">
            {totalPuntosSemana >= 100 
              ? <><FaFire className="text-orange-500 dark:text-orange-400" /> ¡Semana increíble! Sigues en racha</>
              : totalPuntosSemana >= 50
              ? <><FaThumbsUp className="text-green-600 dark:text-green-400" /> ¡Buen trabajo esta semana!</>
              : <><FaDumbbell className="text-blue-600 dark:text-blue-400" /> ¡Vamos por más puntos!</>
            }
          </p>
        </div>
      )}
    </div>
  );
}