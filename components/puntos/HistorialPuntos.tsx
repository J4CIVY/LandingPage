'use client';

import { useState, useEffect } from 'react';
import { FaMotorcycle, FaUsers, FaGift, FaComments, FaStar, FaChartBar } from 'react-icons/fa';
import { PuntosActividad, FiltroHistorial } from '@/types/puntos';

interface HistorialPuntosProps {
  usuarioId: string;
}

interface TransaccionReal {
  _id: string;
  tipo: 'ganancia' | 'gasto';
  puntos: number;
  razon: string;
  metadata: {
    fuente?: string;
    categoria?: string;
    eventoId?: any;
    recompensaId?: any;
  };
  fechaTransaccion: string;
}

interface HistorialResponse {
  transacciones: TransaccionReal[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export default function HistorialPuntos({ usuarioId }: HistorialPuntosProps) {
  const [historial, setHistorial] = useState<PuntosActividad[]>([]);
  const [filtros, setFiltros] = useState<FiltroHistorial>({});
  const [loading, setLoading] = useState(true);
  const [historialFiltrado, setHistorialFiltrado] = useState<PuntosActividad[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const mapearTransaccionReal = (transaccion: TransaccionReal, saldoAcumulado: number): PuntosActividad => {
    const tipoMapeado = mapearTipoTransaccion(transaccion.metadata.categoria || 'otro');
    
    return {
      id: transaccion._id,
      fecha: transaccion.fechaTransaccion,
      tipo: tipoMapeado,
      descripcion: transaccion.razon,
      puntos: transaccion.puntos,
      saldo: saldoAcumulado
    };
  };

  const mapearTipoTransaccion = (categoria: string): PuntosActividad["tipo"] => {
    switch (categoria) {
      case 'evento':
      case 'eventos':
        return 'Evento';
      case 'membresia':
      case 'membership':
        return 'Membresía';
      case 'beneficio':
      case 'beneficios':
        return 'Beneficio';
      case 'comunidad':
      case 'community':
        return 'Comunidad';
      default:
        return 'Otro';
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [usuarioId, pagina]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/history?page=${pagina}&limit=10`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const historialData: HistorialResponse = result.data;
          
          // Calcular saldo acumulado
          let saldoAcumulado = 0;
          const historialMapeado = historialData.transacciones.reverse().map(transaccion => {
            saldoAcumulado += transaccion.puntos;
            return mapearTransaccionReal(transaccion, saldoAcumulado);
          }).reverse();

          setHistorial(historialMapeado);
          setHistorialFiltrado(historialMapeado);
          setTotalPaginas(historialData.totalPaginas);
        } else {
          console.error('Error en respuesta:', result.error);
          // Usar datos vacíos en caso de error
          setHistorial([]);
          setHistorialFiltrado([]);
        }
      } else {
        console.error('Error en request:', response.status);
        setHistorial([]);
        setHistorialFiltrado([]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorial([]);
      setHistorialFiltrado([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let resultado = [...historial];

    // Filtrar por tipo
    if (filtros.tipo) {
      resultado = resultado.filter(item => item.tipo === filtros.tipo);
    }

    // Filtrar por fecha
    if (filtros.fechaInicio) {
      resultado = resultado.filter(item => new Date(item.fecha) >= new Date(filtros.fechaInicio!));
    }

    if (filtros.fechaFin) {
      resultado = resultado.filter(item => new Date(item.fecha) <= new Date(filtros.fechaFin!));
    }

    setHistorialFiltrado(resultado);
  }, [historial, filtros]);

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const tiposActividad = ["Evento", "Membresía", "Beneficio", "Comunidad", "Otro"] as const;

  const getIconoActividad = (tipo: PuntosActividad['tipo']) => {
    const iconos = {
      Evento: <FaMotorcycle className="text-blue-600 dark:text-blue-400" />, 
      Membresía: <FaUsers className="text-purple-600 dark:text-purple-400" />, 
      Beneficio: <FaGift className="text-green-600 dark:text-green-400" />, 
      Comunidad: <FaComments className="text-emerald-600 dark:text-emerald-400" />, 
      Otro: <FaStar className="text-yellow-500 dark:text-yellow-300" />
    };
    return iconos[tipo];
  };

  const getColorActividad = (puntos: number) => {
    return puntos > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
  <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
  <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4 sm:mb-0">
          Historial de Puntos
        </h3>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          {/* Filtro por tipo */}
          <select
            value={filtros.tipo || ''}
            onChange={(e) => setFiltros(prev => ({ 
              ...prev, 
              tipo: e.target.value as PuntosActividad['tipo'] || undefined 
            }))}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100"
          >
            <option value="">Todos los tipos</option>
            {tiposActividad.map(tipo => (
              <option key={tipo} value={tipo}>
                {getIconoActividad(tipo)} {tipo}
              </option>
            ))}
          </select>

          {/* Filtro fecha inicio */}
          <input
            type="date"
            value={filtros.fechaInicio || ''}
            onChange={(e) => setFiltros(prev => ({ 
              ...prev, 
              fechaInicio: e.target.value || undefined 
            }))}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100"
            placeholder="Fecha inicio"
          />

          {/* Filtro fecha fin */}
          <input
            type="date"
            value={filtros.fechaFin || ''}
            onChange={(e) => setFiltros(prev => ({ 
              ...prev, 
              fechaFin: e.target.value || undefined 
            }))}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100"
            placeholder="Fecha fin"
          />

          {/* Limpiar filtros */}
          {(filtros.tipo || filtros.fechaInicio || filtros.fechaFin) && (
            <button
              onClick={limpiarFiltros}
              className="px-3 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de historial */}
  <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
        {historialFiltrado.length > 0 ? (
          <>
            {/* Header para desktop */}
            <div className="hidden md:grid md:grid-cols-5 bg-gray-50 dark:bg-slate-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
              <div>Fecha</div>
              <div>Actividad</div>
              <div>Descripción</div>
              <div className="text-center">Puntos</div>
              <div className="text-center">Saldo</div>
            </div>

            {/* Filas */}
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {historialFiltrado.map((item) => (
                <div key={item.id} className="md:grid md:grid-cols-5 md:items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800">
                  {/* Versión móvil */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.fecha).toLocaleDateString('es-ES')}
                      </span>
                      <span className={`text-lg font-bold ${getColorActividad(item.puntos)}`}>
                        {item.puntos > 0 ? '+' : ''}{item.puntos}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getIconoActividad(item.tipo)}</span>
                      <span className="font-medium dark:text-slate-100">{item.tipo}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.descripcion}</p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Saldo: {item.saldo.toLocaleString()} puntos
                    </div>
                  </div>

                  {/* Versión desktop */}
                  <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
                    {new Date(item.fecha).toLocaleDateString('es-ES')}
                  </div>

                  <div className="hidden md:flex md:items-center md:gap-2">
                    <span className="text-lg">{getIconoActividad(item.tipo)}</span>
                    <span className="text-sm font-medium">{item.tipo}</span>
                  </div>

                  <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
                    {item.descripcion}
                  </div>

                  <div className={`hidden md:block text-center font-bold ${getColorActividad(item.puntos)}`}> 
                    {item.puntos > 0 ? '+' : ''}{item.puntos}
                  </div>

                  <div className="hidden md:block text-center text-sm text-gray-600 dark:text-gray-300">
                    {item.saldo.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaChartBar className="text-6xl mb-4 text-blue-400 dark:text-blue-500 mx-auto" />
            <h4 className="text-lg font-semibold text-gray-600 dark:text-slate-200 mb-2">
              No se encontraron actividades
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              {Object.keys(filtros).length > 0 
                ? 'Intenta ajustar los filtros para ver más resultados'
                : 'Aún no tienes actividades registradas'
              }
            </p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {historialFiltrado.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{historialFiltrado
                .filter(item => item.puntos > 0)
                .reduce((sum, item) => sum + item.puntos, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">Puntos ganados</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {historialFiltrado
                .filter(item => item.puntos < 0)
                .reduce((sum, item) => sum + item.puntos, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">Puntos gastados</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {historialFiltrado.length}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Total actividades</p>
          </div>
        </div>
      )}
    </div>
  );
}