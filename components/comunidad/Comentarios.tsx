'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { 
  FaThumbsUp, 
  FaReply, 
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaFlag,
  FaSpinner,
  FaPaperPlane
} from 'react-icons/fa';
import { Comentario } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';

interface ComentariosProps {
  publicacionId: string;
  comentarios: Comentario[];
  usuarioActual: IUser | null;
  onActualizarComentarios: (comentarios: Comentario[]) => void;
}

interface ComentarioItemProps {
  comentario: Comentario;
  usuarioActual: IUser | null;
  nivel: number;
  onActualizar: (comentario: Comentario) => void;
  onEliminar: (comentarioId: string) => void;
  onResponder: (comentarioPadreId: string) => void;
}

function ComentarioItem({
  comentario,
  usuarioActual,
  nivel,
  onActualizar,
  onEliminar,
  onResponder
}: ComentarioItemProps) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [editando, setEditando] = useState(false);
  const [contenidoEditado, setContenidoEditado] = useState(comentario.contenido);
  const [cargandoReaccion, setCargandoReaccion] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const esAutor = usuarioActual?.id === comentario.autorId;
  const esAdmin = usuarioActual?.role === 'admin' || usuarioActual?.role === 'super-admin';

  // Función para formatear fecha
  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));

    if (minutos < 60) {
      return `${minutos}m`;
    } else if (horas < 24) {
      return `${horas}h`;
    } else {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Función para manejar reacción
  const manejarReaccion = async () => {
    if (!usuarioActual || cargandoReaccion) return;

    setCargandoReaccion(true);
    try {
      const response = await fetch(`/api/comunidad/comentarios/${comentario.id}/reacciones`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
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
      const response = await fetch(`/api/comunidad/comentarios/${comentario.id}`, {
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
      console.error('Error al editar comentario:', error);
    } finally {
      setCargandoEdicion(false);
    }
  };

  // Función para eliminar comentario
  const eliminarComentario = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      const response = await fetch(`/api/comunidad/comentarios/${comentario.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        onEliminar(comentario.id);
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  const yaReacciono = comentario.reacciones.meGusta.includes(usuarioActual?.id || '');

  return (
    <div className={`${nivel > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200 dark:border-slate-700' : ''}`}>
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
          {comentario.autor.firstName[0]}{comentario.autor.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header del comentario */}
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {comentario.autor.firstName} {comentario.autor.lastName}
            </span>
            {comentario.autor.role && (
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                comentario.autor.role === 'admin' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                  : comentario.autor.role === 'super-admin'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
              }`}>
                {comentario.autor.role === 'admin' ? 'Admin' : 
                 comentario.autor.role === 'super-admin' ? 'S.Admin' : 'Miembro'}
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {formatearFecha(comentario.fechaCreacion)}
            </span>
            {comentario.fechaActualizacion && (
              <span className="text-xs text-gray-500 dark:text-gray-300">• editado</span>
            )}

            {/* Menú de opciones */}
            {usuarioActual && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setMostrarMenu(!mostrarMenu)}
                  className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
                  aria-label="Opciones de comentario"
                >
                  <FaEllipsisV className="h-3 w-3" />
                </button>

                {mostrarMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                    <div className="py-1">
                      {esAutor && (
                        <>
                          <button
                            onClick={() => {
                              setEditando(true);
                              setMostrarMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <FaEdit className="h-3 w-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              void eliminarComentario();
                              setMostrarMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <FaTrash className="h-3 w-3" />
                            <span>Eliminar</span>
                          </button>
                        </>
                      )}
                      
                      {esAdmin && !esAutor && (
                        <button
                          onClick={() => {
                            void eliminarComentario();
                            setMostrarMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <FaTrash className="h-3 w-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
                      
                      {!esAutor && (
                        <button
                          onClick={() => setMostrarMenu(false)}
                          className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <FaFlag className="h-3 w-3" />
                          <span>Reportar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contenido del comentario */}
          <div className="mt-1">
            {editando ? (
              <div className="space-y-2">
                <textarea
                  value={contenidoEditado}
                  onChange={(e) => setContenidoEditado(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  rows={2}
                  maxLength={1000}
                  aria-label="Editar comentario"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    {contenidoEditado.length}/1000
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditando(false);
                        setContenidoEditado(comentario.contenido);
                      }}
                      disabled={cargandoEdicion}
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarEdicion}
                      disabled={!contenidoEditado.trim() || cargandoEdicion}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
                    >
                      {cargandoEdicion && <FaSpinner className="animate-spin h-2 w-2" />}
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {comentario.contenido}
              </p>
            )}
          </div>

          {/* Acciones del comentario */}
          {usuarioActual && !editando && (
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={manejarReaccion}
                disabled={cargandoReaccion}
                className={`flex items-center space-x-1 text-xs ${
                  yaReacciono ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <FaThumbsUp className="h-3 w-3" />
                <span>
                  {comentario.reacciones.meGusta.length > 0 && comentario.reacciones.meGusta.length}
                </span>
                <span>Me gusta</span>
              </button>

              {nivel < 2 && (
                <button
                  onClick={() => onResponder(comentario.id)}
                  className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <FaReply className="h-3 w-3" />
                  <span>Responder</span>
                </button>
              )}
            </div>
          )}

          {/* Respuestas */}
          {comentario.respuestas && comentario.respuestas.length > 0 && (
            <div className="mt-3 space-y-3">
              {comentario.respuestas.map((respuesta) => (
                <ComentarioItem
                  key={respuesta.id}
                  comentario={respuesta}
                  usuarioActual={usuarioActual}
                  nivel={nivel + 1}
                  onActualizar={onActualizar}
                  onEliminar={onEliminar}
                  onResponder={onResponder}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comentarios({
  publicacionId,
  comentarios: comentariosProp,
  usuarioActual,
  onActualizarComentarios
}: ComentariosProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(comentariosProp);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respondiendoA, setRespondiendoA] = useState<string | null>(null);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    void cargarComentarios();
  }, [publicacionId]);

  // Función para cargar comentarios desde la API
  const cargarComentarios = async () => {
    setCargandoComentarios(true);
    try {
      const response = await fetch(`/api/comunidad/publicaciones/${publicacionId}/comentarios`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComentarios(data.datos || []);
        onActualizarComentarios(data.datos || []);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setCargandoComentarios(false);
    }
  };

  // Función para enviar comentario
  const enviarComentario = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!nuevoComentario.trim() || !usuarioActual || cargandoEnvio) return;

    setCargandoEnvio(true);
    try {
      const response = await fetch('/api/comunidad/comentarios', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenido: nuevoComentario,
          publicacionId,
          comentarioPadreId: respondiendoA
        })
      });

      if (response.ok) {
        await response.json();
        
        // Recargar comentarios
        const comentariosResponse = await fetch(`/api/comunidad/publicaciones/${publicacionId}/comentarios`, {
          credentials: 'include'
        });
        
        if (comentariosResponse.ok) {
          const comentariosData = await comentariosResponse.json();
          setComentarios(comentariosData.datos || []);
          onActualizarComentarios(comentariosData.datos || []);
        }

        setNuevoComentario('');
        setRespondiendoA(null);
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    } finally {
      setCargandoEnvio(false);
    }
  };

  // Función para actualizar un comentario individual
  const actualizarComentario = (comentarioActualizado: Comentario) => {
    const actualizarRecursivo = (lista: Comentario[]): Comentario[] => {
      return lista.map(comentario => {
        if (comentario.id === comentarioActualizado.id) {
          return comentarioActualizado;
        }
        if (comentario.respuestas) {
          return {
            ...comentario,
            respuestas: actualizarRecursivo(comentario.respuestas)
          };
        }
        return comentario;
      });
    };

    setComentarios(actualizarRecursivo(comentarios));
    onActualizarComentarios(actualizarRecursivo(comentarios));
  };

  // Función para eliminar un comentario
  const eliminarComentario = (comentarioId: string) => {
    const filtrarRecursivo = (lista: Comentario[]): Comentario[] => {
      return lista
        .filter(comentario => comentario.id !== comentarioId)
        .map(comentario => ({
          ...comentario,
          respuestas: comentario.respuestas ? filtrarRecursivo(comentario.respuestas) : []
        }));
    };

    const comentariosActualizados = filtrarRecursivo(comentarios);
    setComentarios(comentariosActualizados);
    onActualizarComentarios(comentariosActualizados);
  };

  // Obtener comentarios principales (sin padre)
  const comentariosPrincipales = comentarios.filter(c => !c.comentarioPadreId);

  return (
  <div className="space-y-4">
      {/* Formulario para nuevo comentario */}
      {usuarioActual && (
        <form onSubmit={enviarComentario} className="space-y-3">
          {respondiendoA && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-2 rounded">
              <span className="text-sm text-blue-700 dark:text-blue-200">
                Respondiendo a un comentario
              </span>
              <button
                type="button"
                onClick={() => setRespondiendoA(null)}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400"
              >
                Cancelar
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {usuarioActual.firstName[0]}{usuarioActual.lastName[0]}
            </div>
            <div className="flex-1">
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                rows={2}
                maxLength={1000}
                disabled={cargandoEnvio}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {nuevoComentario.length}/1000 caracteres
                </span>
                <button
                  type="submit"
                  disabled={!nuevoComentario.trim() || cargandoEnvio}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
                >
                  {cargandoEnvio ? (
                    <FaSpinner className="animate-spin h-3 w-3" />
                  ) : (
                    <FaPaperPlane className="h-3 w-3" />
                  )}
                  <span>Comentar</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Lista de comentarios */}
      {cargandoComentarios ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin h-6 w-6 mx-auto text-gray-400 dark:text-gray-300" />
          <p className="text-gray-500 dark:text-gray-300 mt-2">Cargando comentarios...</p>
        </div>
      ) : comentariosPrincipales.length > 0 ? (
        <div className="space-y-4">
          {comentariosPrincipales.map((comentario) => (
            <ComentarioItem
              key={comentario.id}
              comentario={comentario}
              usuarioActual={usuarioActual}
              nivel={0}
              onActualizar={actualizarComentario}
              onEliminar={eliminarComentario}
              onResponder={setRespondiendoA}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-300">
          <p>No hay comentarios aún.</p>
          <p className="text-sm">¡Sé el primero en comentar!</p>
        </div>
      )}
    </div>
  );
}