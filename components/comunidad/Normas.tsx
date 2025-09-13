'use client';

import { useState } from 'react';
import { 
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimes,
  FaEye,
  FaUserSlash,
  FaTrash,
  FaFlag,
  FaClock
} from 'react-icons/fa';
import { ReporteContenido } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';

interface NormasProps {
  usuarioActual: IUser | null;
}

interface TablaReportesProps {
  reportes: ReporteContenido[];
  onActualizarReporte: (reporteId: string, accion: 'resolver' | 'rechazar') => void;
}

function TablaReportes({ reportes, onActualizarReporte }: TablaReportesProps) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'revisado': return 'bg-blue-100 text-blue-800';
      case 'resuelto': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <FaClock className="h-4 w-4" />;
      case 'revisado': return <FaEye className="h-4 w-4" />;
      case 'resuelto': return <FaCheckCircle className="h-4 w-4" />;
      case 'rechazado': return <FaTimes className="h-4 w-4" />;
      default: return <FaFlag className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <FaFlag className="h-5 w-5 text-red-500" />
          <span>Reportes de Contenido</span>
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contenido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay reportes pendientes
                </td>
              </tr>
            ) : (
              reportes.map((reporte) => (
                <tr key={reporte.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reporte.tipoContenido.charAt(0).toUpperCase() + reporte.tipoContenido.slice(1)}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      ID: {reporte.contenidoId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{reporte.motivo}</div>
                    {reporte.descripcion && (
                      <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                        {reporte.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reporte.estado)}`}>
                      {getEstadoIcono(reporte.estado)}
                      <span>{reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reporte.fechaReporte).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {reporte.estado === 'pendiente' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onActualizarReporte(reporte.id, 'resolver')}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Marcar como resuelto"
                        >
                          <FaCheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onActualizarReporte(reporte.id, 'rechazar')}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Rechazar reporte"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Normas({ usuarioActual }: NormasProps) {
  const [vistaActiva, setVistaActiva] = useState<'normas' | 'moderacion'>('normas');
  const [reportes] = useState<ReporteContenido[]>([
    // Datos de ejemplo - en producción vendrían de la API
    {
      id: '1',
      reportadorId: 'user1',
      contenidoId: 'post1',
      tipoContenido: 'publicacion',
      motivo: 'Contenido inapropiado',
      descripcion: 'La publicación contiene lenguaje ofensivo',
      estado: 'pendiente',
      fechaReporte: new Date(),
    },
    {
      id: '2',
      reportadorId: 'user2',
      contenidoId: 'comment1',
      tipoContenido: 'comentario',
      motivo: 'Spam',
      estado: 'revisado',
      fechaReporte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    }
  ]);

  const esAdmin = usuarioActual?.role === 'admin' || usuarioActual?.role === 'moderator';

  const normasComunidad = [
    {
      titulo: 'Respeto Mutuo',
      descripcion: 'Trata a todos los miembros con respeto y cortesía. No toleramos insultos, acoso o discriminación de ningún tipo.',
      icono: '🤝'
    },
    {
      titulo: 'Contenido Apropiado',
      descripcion: 'Comparte solo contenido relevante para la comunidad motociclista. Evita spam, contenido sexual explícito o violento.',
      icono: '✅'
    },
    {
      titulo: 'Privacidad y Seguridad',
      descripcion: 'No compartas información personal de otros miembros sin su consentimiento. Respeta la privacidad de todos.',
      icono: '🔐'
    },
    {
      titulo: 'No Spam ni Promoción Excesiva',
      descripcion: 'Evita el spam y la promoción excesiva de productos o servicios. Las promociones deben ser aprobadas por moderadores.',
      icono: '🚫'
    },
    {
      titulo: 'Seguridad Vial',
      descripcion: 'Promovemos la conducción segura y responsable. No glorifiques comportamientos peligrosos en la vía.',
      icono: '🛡️'
    },
    {
      titulo: 'Información Veraz',
      descripcion: 'Comparte información precisa y verificada. Evita rumores y noticias falsas que puedan confundir a la comunidad.',
      icono: '📋'
    }
  ];

  const consecuencias = [
    {
      nivel: 'Advertencia',
      descripcion: 'Primera infracción menor - advertencia verbal/escrita',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      nivel: 'Suspensión Temporal',
      descripcion: 'Infracciones repetidas - suspensión de 1-7 días',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      nivel: 'Suspensión Prolongada',
      descripcion: 'Infracciones graves - suspensión de 1-4 semanas',
      color: 'bg-red-100 text-red-800'
    },
    {
      nivel: 'Expulsión Permanente',
      descripcion: 'Infracciones muy graves o comportamiento reincidente',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const accionesModerador = [
    {
      nombre: 'Eliminar Contenido',
      descripcion: 'Remover publicaciones, comentarios o mensajes que violen las normas',
      icono: <FaTrash className="h-5 w-5 text-red-500" />
    },
    {
      nombre: 'Suspender Usuario',
      descripcion: 'Suspender temporalmente el acceso de un usuario a la comunidad',
      icono: <FaUserSlash className="h-5 w-5 text-orange-500" />
    },
    {
      nombre: 'Revisar Reportes',
      descripcion: 'Evaluar y tomar decisiones sobre contenido reportado por usuarios',
      icono: <FaFlag className="h-5 w-5 text-blue-500" />
    },
    {
      nombre: 'Advertir Usuario',
      descripcion: 'Enviar advertencias oficiales a usuarios que infrinjan normas',
      icono: <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    }
  ];

  const manejarActualizarReporte = async (reporteId: string, accion: 'resolver' | 'rechazar') => {
    try {
      const response = await fetch(`/api/comunidad/reportes/${reporteId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          estado: accion === 'resolver' ? 'resuelto' : 'rechazado' 
        })
      });

      if (response.ok) {
        // Recargar reportes
        console.log(`Reporte ${reporteId} ${accion === 'resolver' ? 'resuelto' : 'rechazado'}`);
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <FaShieldAlt className="h-8 w-8 text-blue-600" />
            <span>Normas de la Comunidad</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Mantengamos un ambiente seguro y respetuoso para todos los miembros de BSKMT
          </p>
        </div>

        {/* Navegación */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setVistaActiva('normas')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
              vistaActiva === 'normas'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Normas de Convivencia
          </button>
          {esAdmin && (
            <button
              onClick={() => setVistaActiva('moderacion')}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                vistaActiva === 'moderacion'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Panel de Moderación
            </button>
          )}
        </div>

        {/* Vista de Normas */}
        {vistaActiva === 'normas' && (
          <div className="space-y-8">
            {/* Introducción */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Bienvenido a la Comunidad BSKMT
              </h2>
              <p className="text-blue-800">
                Estas normas están diseñadas para crear un ambiente positivo donde todos los motociclistas 
                puedan compartir experiencias, aprender y crear vínculos duraderos. Al participar en nuestra 
                comunidad, aceptas seguir estas pautas.
              </p>
            </div>

            {/* Normas principales */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Normas de Comportamiento</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {normasComunidad.map((norma, indice) => (
                  <div key={indice} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">{norma.icono}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{norma.titulo}</h3>
                        <p className="text-gray-700">{norma.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consecuencias */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Consecuencias por Infracciones</h2>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-200">
                  {consecuencias.map((consecuencia, indice) => (
                    <div key={indice} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${consecuencia.color} mb-2`}>
                            {consecuencia.nivel}
                          </span>
                          <p className="text-gray-700">{consecuencia.descripcion}</p>
                        </div>
                        <span className="text-2xl font-bold text-gray-400">
                          {indice + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cómo reportar */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center space-x-2">
                <FaFlag className="h-5 w-5" />
                <span>¿Cómo Reportar Contenido Inapropiado?</span>
              </h3>
              <div className="text-yellow-800 space-y-2">
                <p>1. Haz clic en el menú de tres puntos (⋯) en cualquier publicación, comentario o mensaje</p>
                <p>2. Selecciona "Reportar" del menú desplegable</p>
                <p>3. Describe brevemente el motivo del reporte</p>
                <p>4. Nuestro equipo de moderadores revisará el reporte en un plazo de 24-48 horas</p>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Tienes Preguntas sobre las Normas?
              </h3>
              <p className="text-gray-700 mb-4">
                Si tienes dudas sobre alguna norma o necesitas aclaración sobre una decisión de moderación, 
                no dudes en contactarnos.
              </p>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Contactar Moderadores
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Ver FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Moderación */}
        {vistaActiva === 'moderacion' && esAdmin && (
          <div className="space-y-8">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <FaFlag className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {reportes.filter(r => r.estado === 'pendiente').length}
                    </p>
                    <p className="text-gray-600">Reportes Pendientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {reportes.filter(r => r.estado === 'resuelto').length}
                    </p>
                    <p className="text-gray-600">Reportes Resueltos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <FaUserSlash className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-gray-600">Usuarios Suspendidos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <FaTrash className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-gray-600">Contenido Eliminado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Herramientas de moderación */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Herramientas de Moderación</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {accionesModerador.map((accion, indice) => (
                  <div key={indice} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {accion.icono}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{accion.nombre}</h3>
                        <p className="text-gray-700">{accion.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla de reportes */}
            <TablaReportes 
              reportes={reportes}
              onActualizarReporte={manejarActualizarReporte}
            />
          </div>
        )}

        {/* Mensaje para usuarios no autorizados */}
        {vistaActiva === 'moderacion' && !esAdmin && (
          <div className="text-center py-12">
            <FaShieldAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600">
              Solo los moderadores y administradores pueden acceder a esta sección.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}