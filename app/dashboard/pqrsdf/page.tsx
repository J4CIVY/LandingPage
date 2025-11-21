'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { 
  FaPlus, 
  FaFileAlt, 
  FaClock, 
  FaCheck, 
  FaExclamationTriangle,
  FaComments,
  FaSpinner,
  FaTable,
  FaTh
} from 'react-icons/fa';

// Importar componentes
import SolicitudTable from '@/components/dashboard/pqrsdf/SolicitudTable';
import SolicitudCard from '@/components/dashboard/pqrsdf/SolicitudCard';
import FiltrosSolicitudes from '@/components/dashboard/pqrsdf/FiltrosSolicitudes';

// Importar tipos y servicios
import { Solicitud, FiltroSolicitudes, EstadisticasSolicitudes } from '@/types/pqrsdf';
import { PQRSDFService } from '@/lib/services/pqrsdf-service';

export default function PQRSDFPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<Solicitud[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasSolicitudes | null>(null);
  const [filtros, setFiltros] = useState<FiltroSolicitudes>({});
  const [vistaTabla, setVistaTabla] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?._id) {
      void cargarDatos();
    } else if (!authLoading && !user) {
      // Si no está cargando auth y no hay usuario, mostrar error
      setError('Usuario no autenticado');
      setCargando(false);
    }
  }, [user?._id, authLoading]);

  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [solicitudes, filtros]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);


      const [solicitudesData, estadisticasData] = await Promise.all([
        PQRSDFService.obtenerSolicitudes(user!._id as string),
        PQRSDFService.obtenerEstadisticas(user!._id as string)
      ]);


      setSolicitudes(solicitudesData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      setError('Error al cargar las solicitudes. Por favor, intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...solicitudes];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(s => 
        s.numeroSolicitud.toLowerCase().includes(busqueda) ||
        s.asunto.toLowerCase().includes(busqueda) ||
        s.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(s => s.categoria === filtros.categoria);
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(s => s.estado === filtros.estado);
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde) {
      resultado = resultado.filter(s => s.fechaCreacion >= filtros.fechaDesde!);
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
      resultado = resultado.filter(s => s.fechaCreacion <= filtros.fechaHasta!);
    }

    setSolicitudesFiltradas(resultado);
  };

  if (authLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-slate-400">Verificando autenticación...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Usuario no autenticado
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Necesitas estar autenticado para acceder a esta página.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (cargando) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-slate-400">Cargando solicitudes...</p>
                <p className="text-xs text-gray-500 mt-2">Usuario ID: {String(user._id)}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Error al cargar
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
              <button
                onClick={cargarDatos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                  PQRSDF - Gestión de Solicitudes
                </h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  Administra tus peticiones, quejas, reclamos, sugerencias, denuncias y felicitaciones
                </p>
              </div>
              
              <Link
                href="/dashboard/pqrsdf/nueva"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FaFileAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {estadisticas.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <FaClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">En Revisión</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {estadisticas.porEstado.en_revision}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FaCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Respondidas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {estadisticas.porEstado.respondida}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FaComments className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Tiempo Promedio</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {estadisticas.tiempoPromedioRespuesta}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <FiltrosSolicitudes
            filtros={filtros}
            onFiltrosChange={setFiltros}
            className="mb-6"
          />

          {/* Controles de vista */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setVistaTabla(true)}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    vistaTabla 
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm' 
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                  aria-label="Ver como tabla"
                >
                  <FaTable className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVistaTabla(false)}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    !vistaTabla 
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm' 
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                  aria-label="Ver como cuadrícula"
                >
                  <FaTh className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de solicitudes */}
          {vistaTabla ? (
            <SolicitudTable solicitudes={solicitudesFiltradas} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solicitudesFiltradas.map((solicitud) => (
                <SolicitudCard key={solicitud.id} solicitud={solicitud} />
              ))}
            </div>
          )}

          {/* Estado vacío */}
          {solicitudesFiltradas.length === 0 && solicitudes.length > 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                No se encontraron solicitudes
              </h3>
              <p className="text-gray-500 dark:text-slate-400">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          )}

          {/* Estado vacío total */}
          {solicitudes.length === 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-slate-100 mb-2">
                Aún no tienes solicitudes
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                Crea tu primera solicitud PQRSDF para comenzar.
              </p>
              <Link
                href="/dashboard/pqrsdf/nueva"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                Crear Primera Solicitud
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
