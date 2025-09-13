'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaTimes,
  FaCheck,
  FaPaperclip,
  FaDownload
} from 'react-icons/fa';

// Importar componentes
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Timeline from '@/components/dashboard/pqrsdf/Timeline';
import ChatBox from '@/components/dashboard/pqrsdf/ChatBox';

// Importar tipos y servicios
import { 
  Solicitud, 
  CATEGORIAS_SOLICITUD, 
  ESTADOS_SOLICITUD, 
  COLORES_ESTADO,
  ICONOS_CATEGORIA 
} from '@/types/pqrsdf';
import { PQRSDFService } from '@/lib/services/pqrsdf-service';

export default function DetalleSolicitudPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const solicitudId = params.id as string;

  // Estados
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cerrandoSolicitud, setCerrandoSolicitud] = useState(false);

  // Cargar solicitud
  useEffect(() => {
    if (solicitudId && user) {
      cargarSolicitud();
    }
  }, [solicitudId, user]);

  const cargarSolicitud = async () => {
    try {
      setCargando(true);
      setError(null);

      const solicitudData = await PQRSDFService.obtenerSolicitud(solicitudId);
      
      if (!solicitudData) {
        setError('Solicitud no encontrada');
        return;
      }

      // Verificar que la solicitud pertenece al usuario
      if (solicitudData.usuarioId !== user?._id) {
        setError('No tienes permisos para ver esta solicitud');
        return;
      }

      setSolicitud(solicitudData);
    } catch (err) {
      setError('Error al cargar la solicitud');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  // Enviar mensaje
  const handleEnviarMensaje = async (contenido: string, adjuntos?: File[]) => {
    if (!solicitud || !user) return;

    try {
      await PQRSDFService.enviarMensaje(
        solicitud.id, 
        contenido, 
        `${user.firstName} ${user.lastName}`
      );
      
      // Recargar solicitud para mostrar el nuevo mensaje
      await cargarSolicitud();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  };

  // Cerrar solicitud
  const handleCerrarSolicitud = async () => {
    if (!solicitud || !user || cerrandoSolicitud) return;

    const confirmar = window.confirm(
      '¿Estás seguro de que deseas cerrar esta solicitud? Esta acción no se puede deshacer.'
    );

    if (!confirmar) return;

    try {
      setCerrandoSolicitud(true);
      
      await PQRSDFService.cerrarSolicitud(
        solicitud.id,
        `${user.firstName} ${user.lastName}`
      );
      
      // Recargar para mostrar el estado actualizado
      await cargarSolicitud();
    } catch (error) {
      console.error('Error al cerrar solicitud:', error);
      alert('Error al cerrar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setCerrandoSolicitud(false);
    }
  };

  // Formatear tamaño de archivo
  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
  };

  if (cargando) {
    return (
      <>
        <DashboardHeader />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-slate-400">Cargando solicitud...</p>
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
        <DashboardHeader />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Error
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
              <div className="space-x-3">
                <button
                  onClick={cargarSolicitud}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Reintentar
                </button>
                <Link
                  href="/dashboard/pqrsdf"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Volver a Solicitudes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!solicitud) return null;

  const puedeResponder = solicitud.estado !== 'cerrada';
  const puedeSerCerrada = solicitud.estado === 'respondida';

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/pqrsdf"
              className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-4"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Volver a Solicitudes
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {solicitud.numeroSolicitud}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl">
                    {ICONOS_CATEGORIA[solicitud.categoria]}
                  </span>
                  <span className="text-gray-600 dark:text-slate-400">
                    {CATEGORIAS_SOLICITUD[solicitud.categoria]}
                  </span>
                </div>
              </div>
              
              {puedeSerCerrada && (
                <button
                  onClick={handleCerrarSolicitud}
                  disabled={cerrandoSolicitud}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {cerrandoSolicitud ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cerrar Solicitud
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Detalles de la solicitud */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                {/* Estado y fechas */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${COLORES_ESTADO[solicitud.estado]}`}>
                    {ESTADOS_SOLICITUD[solicitud.estado]}
                  </span>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                    <FaClock className="w-4 h-4 mr-1" />
                    Creada: {format(solicitud.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                  
                  {solicitud.fechaActualizacion !== solicitud.fechaCreacion && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                      <FaClock className="w-4 h-4 mr-1" />
                      Actualizada: {format(solicitud.fechaActualizacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  )}
                  
                  {solicitud.fechaCierre && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                      <FaCheck className="w-4 h-4 mr-1" />
                      Cerrada: {format(solicitud.fechaCierre, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  )}
                </div>

                {/* Asunto */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    Asunto
                  </h2>
                  <p className="text-gray-700 dark:text-slate-300">
                    {solicitud.asunto}
                  </p>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    Descripción
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                      {solicitud.descripcion}
                    </p>
                  </div>
                </div>

                {/* Adjuntos iniciales */}
                {solicitud.adjuntos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                      Adjuntos
                    </h3>
                    <div className="space-y-2">
                      {solicitud.adjuntos.map((adjunto) => (
                        <div key={adjunto.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FaPaperclip className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-slate-100">{adjunto.nombre}</span>
                            <span className="text-gray-500 dark:text-slate-400">
                              ({formatearTamaño(adjunto.tamaño)})
                            </span>
                          </div>
                          <a 
                            href={adjunto.url} 
                            download 
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FaDownload className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-6">
              {/* Resumen */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Resumen
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Estado:</span>
                    <span className={`font-medium ${
                      solicitud.estado === 'en_revision' ? 'text-blue-600 dark:text-blue-400' :
                      solicitud.estado === 'respondida' ? 'text-green-600 dark:text-green-400' :
                      solicitud.estado === 'cerrada' ? 'text-gray-600 dark:text-gray-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {ESTADOS_SOLICITUD[solicitud.estado]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Categoría:</span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {CATEGORIAS_SOLICITUD[solicitud.categoria]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Prioridad:</span>
                    <span className={`font-medium capitalize ${
                      solicitud.prioridad === 'alta' ? 'text-red-600 dark:text-red-400' :
                      solicitud.prioridad === 'media' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {solicitud.prioridad}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Mensajes:</span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {solicitud.mensajes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <Timeline eventos={solicitud.timeline} />
            </div>
          </div>

          {/* Chat / Conversación */}
          <ChatBox
            mensajes={solicitud.mensajes}
            onEnviarMensaje={puedeResponder ? handleEnviarMensaje : undefined}
            puedeResponder={puedeResponder}
            className="h-96"
          />
        </div>
      </div>
    </>
  );
}