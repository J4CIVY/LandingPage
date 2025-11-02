'use client';

import { useState } from 'react';
import { 
  FaHeart, 
  FaThumbsUp, 
  FaFire, 
  FaComment, 
  FaShare, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash,
  FaFlag,
  FaSpinner
} from 'react-icons/fa';
import { Publicacion } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';
import Comentarios from './Comentarios';
import { sanitizeText } from '@/lib/input-sanitization';

interface PublicacionCardProps {
  publicacion: Publicacion;
  usuarioActual: IUser | null;
  onActualizar: (publicacion: Publicacion) => void;
  onEliminar: (publicacionId: string) => void;
}

export default function PublicacionCard({
  publicacion,
  usuarioActual,
  onActualizar,
  onEliminar
}: PublicacionCardProps) {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [editando, setEditando] = useState(false);
  const [contenidoEditado, setContenidoEditado] = useState(publicacion.contenido);
  const [cargandoReaccion, setCargandoReaccion] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [cantidadComentarios, setCantidadComentarios] = useState(0);

  // SECURITY: Sanitize user-generated content to prevent XSS
  const safeFirstName = sanitizeText(publicacion.autor.firstName, 50);
  const safeLastName = sanitizeText(publicacion.autor.lastName, 50);
  const safeContenido = sanitizeText(publicacion.contenido, 5000);

  const esAutor = usuarioActual?.id === publicacion.autorId;
  const esAdmin = usuarioActual?.role === 'admin' || usuarioActual?.role === 'super-admin';
  
  // Función para formatear fecha
  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `hace ${minutos} minutos`;
    } else if (horas < 24) {
      return `hace ${horas} horas`;
    } else if (dias < 7) {
      return `hace ${dias} días`;
    } else {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  // Función para manejar reacciones
  const manejarReaccion = async (tipoReaccion: 'meGusta' | 'corazones' | 'fuego') => {
    if (!usuarioActual || cargandoReaccion) return;

    setCargandoReaccion(true);
    try {
      const response = await fetch(`/api/comunidad/publicaciones/${publicacion.id}/reacciones`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tipo: tipoReaccion })
      });

      if (response.ok) {
        const data = await response.json();
        onActualizar(data.datos);
      }
    } catch (error) {
      console.error('Error al reaccionar:', error);
    } finally {
      setCargandoReaccion(false);
    }
  };

  // Función para guardar edición
  const guardarEdicion = async () => {
    if (!contenidoEditado.trim() || cargandoEdicion) return;

    setCargandoEdicion(true);
    try {
      const response = await fetch(`/api/comunidad/publicaciones/${publicacion.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contenido: contenidoEditado })
      });

      if (response.ok) {
        const data = await response.json();
        onActualizar(data.datos);
        setEditando(false);
      }
    } catch (error) {
      console.error('Error al editar publicación:', error);
    } finally {
      setCargandoEdicion(false);
    }
  };

  // Función para eliminar publicación
  const eliminarPublicacion = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

    try {
      const response = await fetch(`/api/comunidad/publicaciones/${publicacion.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        onEliminar(publicacion.id);
      }
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
    }
  };

  // Función para reportar contenido
  const reportarContenido = async () => {
    const motivo = prompt('¿Por qué quieres reportar esta publicación?');
    if (!motivo) return;

    try {
      await fetch('/api/comunidad/reportes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenidoId: publicacion.id,
          tipoContenido: 'publicacion',
          motivo
        })
      });

      alert('Reporte enviado. Lo revisaremos pronto.');
    } catch (error) {
      console.error('Error al reportar:', error);
    }
  };

  // Verificar si el usuario ya reaccionó
  const yaReacciono = (tipo: 'meGusta' | 'corazones' | 'fuego') => {
    return publicacion.reacciones[tipo].includes(usuarioActual?.id || '');
  };

  return (
  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      {/* Header de la publicación */}
  <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white font-medium">
            {safeFirstName[0]}{safeLastName[0]}
          </div>
          
          {/* Info del autor */}
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {safeFirstName} {safeLastName}
              </h4>
              {publicacion.autor.role && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  publicacion.autor.role === 'admin' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                    : publicacion.autor.role === 'super-admin'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {publicacion.autor.role === 'admin' ? 'Administrador' : 
                   publicacion.autor.role === 'super-admin' ? 'Super Admin' : 'Miembro'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-300">
              <span>{formatearFecha(publicacion.fechaCreacion)}</span>
              {publicacion.esEditado && <span>• Editado</span>}
            </div>
          </div>
        </div>

        {/* Menú de opciones */}
        {usuarioActual && (
          <div className="relative">
            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
            >
              <FaEllipsisV className="h-4 w-4" />
            </button>

            {mostrarMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                <div className="py-1">
                  {esAutor && (
                    <>
                      <button
                        onClick={() => {
                          setEditando(true);
                          setMostrarMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <FaEdit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          eliminarPublicacion();
                          setMostrarMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <FaTrash className="h-4 w-4" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  )}
                  
                  {esAdmin && !esAutor && (
                    <button
                      onClick={() => {
                        eliminarPublicacion();
                        setMostrarMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <FaTrash className="h-4 w-4" />
                      <span>Eliminar (Admin)</span>
                    </button>
                  )}
                  
                  {!esAutor && (
                    <button
                      onClick={() => {
                        void reportarContenido();
                        setMostrarMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <FaFlag className="h-4 w-4" />
                      <span>Reportar</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido de la publicación */}
      <div className="mb-4">
        {editando ? (
          <div className="space-y-3">
            <textarea
              value={contenidoEditado}
              onChange={(e) => setContenidoEditado(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              rows={4}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-300">
                {contenidoEditado.length}/5000 caracteres
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditando(false);
                    setContenidoEditado(publicacion.contenido);
                  }}
                  disabled={cargandoEdicion}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicion}
                  disabled={!contenidoEditado.trim() || cargandoEdicion}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
                >
                  {cargandoEdicion && <FaSpinner className="animate-spin h-3 w-3" />}
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{safeContenido}</p>
        )}
      </div>

      {/* Imágenes */}
      {publicacion.imagenes && publicacion.imagenes.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          publicacion.imagenes.length === 1 ? 'grid-cols-1' :
          publicacion.imagenes.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {publicacion.imagenes.map((imagen, indice) => (
            <img
              key={indice}
              src={imagen}
              alt={`Imagen ${indice + 1}`}
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => {
                // Aquí se podría abrir un modal para ver la imagen completa
                window.open(imagen, '_blank');
              }}
            />
          ))}
        </div>
      )}

      {/* Estadísticas de reacciones */}
      {(publicacion.reacciones.meGusta.length > 0 || 
        publicacion.reacciones.corazones.length > 0 || 
        publicacion.reacciones.fuego.length > 0) && (
  <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
          {publicacion.reacciones.meGusta.length > 0 && (
            <span className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
              <FaThumbsUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{publicacion.reacciones.meGusta.length}</span>
            </span>
          )}
          {publicacion.reacciones.corazones.length > 0 && (
            <span className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
              <FaHeart className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>{publicacion.reacciones.corazones.length}</span>
            </span>
          )}
          {publicacion.reacciones.fuego.length > 0 && (
            <span className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
              <FaFire className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>{publicacion.reacciones.fuego.length}</span>
            </span>
          )}
          {cantidadComentarios > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-auto">
              {cantidadComentarios} comentarios
            </span>
          )}
        </div>
      )}

      {/* Botones de acción */}
      {usuarioActual && !editando && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Reacciones */}
            <button
              onClick={() => manejarReaccion('meGusta')}
              disabled={cargandoReaccion}
              className={`flex items-center space-x-2 ${
                yaReacciono('meGusta') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <FaThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">Me gusta</span>
            </button>

            <button
              onClick={() => manejarReaccion('corazones')}
              disabled={cargandoReaccion}
              className={`flex items-center space-x-2 ${
                yaReacciono('corazones') 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <FaHeart className="h-4 w-4" />
              <span className="text-sm font-medium">Amar</span>
            </button>

            <button
              onClick={() => manejarReaccion('fuego')}
              disabled={cargandoReaccion}
              className={`flex items-center space-x-2 ${
                yaReacciono('fuego') 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <FaFire className="h-4 w-4" />
              <span className="text-sm font-medium">Genial</span>
            </button>

            <button
              onClick={() => setMostrarComentarios(!mostrarComentarios)}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FaComment className="h-4 w-4" />
              <span className="text-sm font-medium">Comentar</span>
            </button>
          </div>

          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <FaShare className="h-4 w-4" />
            <span className="text-sm font-medium">Compartir</span>
          </button>
        </div>
      )}

      {/* Sección de comentarios */}
      {mostrarComentarios && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <Comentarios
            publicacionId={publicacion.id}
            comentarios={publicacion.comentarios}
            usuarioActual={usuarioActual}
            onActualizarComentarios={(comentarios) => {
              setCantidadComentarios(comentarios.length);
              onActualizar({ ...publicacion, comentarios });
            }}
          />
        </div>
      )}
    </div>
  );
}