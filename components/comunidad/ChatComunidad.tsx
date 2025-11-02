'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FaPaperPlane, 
  FaUsers, 
  FaCircle,
  FaEllipsisV,
  FaTrash,
  FaFlag,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner
} from 'react-icons/fa';
import { ChatMensaje, UsuarioEnLinea } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';

interface ChatComunidadProps {
  mensajes: ChatMensaje[];
  usuarioActual: IUser | null;
  onEnviarMensaje: () => void;
  grupoId?: string | null;
}

export default function ChatComunidad({
  mensajes,
  usuarioActual,
  onEnviarMensaje,
  grupoId
}: ChatComunidadProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuariosEnLinea, setUsuariosEnLinea] = useState<UsuarioEnLinea[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [silenciado, setSilenciado] = useState(false);

  const mensajesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const esAdmin = usuarioActual?.role === 'admin' || usuarioActual?.role === 'super-admin';

  // Cargar usuarios en línea
  const cargarUsuariosEnLinea = async () => {
    try {
      setCargandoUsuarios(true);
      const response = await fetch('/api/comunidad/usuarios-en-linea', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuariosEnLinea(data.datos || []);
      }
    } catch (error) {
      console.error('Error al cargar usuarios en línea:', error);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  // Actualizar actividad del usuario
  const actualizarActividad = async () => {
    try {
      await fetch('/api/comunidad/usuarios-en-linea', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
    }
  };

  // Cargar usuarios en línea al montar el componente
  useEffect(() => {
    if (usuarioActual) {
      void cargarUsuariosEnLinea();
      void actualizarActividad();
      
      // Actualizar usuarios en línea cada 30 segundos
      const intervaloUsuarios = setInterval(() => void cargarUsuariosEnLinea(), 30000);
      
      // Actualizar actividad cada 5 minutos
      const intervaloActividad = setInterval(() => void actualizarActividad(), 5 * 60 * 1000);
      
      return () => {
        clearInterval(intervaloUsuarios);
        clearInterval(intervaloActividad);
      };
    }
  }, [usuarioActual]);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Función para formatear hora
  const formatearHora = (fecha: Date | string) => {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar si un usuario está en línea
  const estaEnLinea = (ultimaActividad: Date | string) => {
    const ahora = new Date();
    const fechaActividad = typeof ultimaActividad === 'string' ? new Date(ultimaActividad) : ultimaActividad;
    const diferencia = ahora.getTime() - fechaActividad.getTime();
    return diferencia < 5 * 60 * 1000; // 5 minutos
  };

  // Función para enviar mensaje
  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !usuarioActual || enviandoMensaje) return;

    const mensajeTexto = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviandoMensaje(true);

    try {
      const response = await fetch('/api/comunidad/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenido: mensajeTexto,
          grupoId: grupoId || null
        })
      });

      if (response.ok) {
        onEnviarMensaje();
        
        // Reproducir sonido de notificación si no está silenciado
        if (!silenciado) {
          // Aquí se podría reproducir un sonido
        }
      } else {
        // Restaurar mensaje si falla
        setNuevoMensaje(mensajeTexto);
        console.error('Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      setNuevoMensaje(mensajeTexto);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  // Función para eliminar mensaje
  const eliminarMensaje = async (mensajeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return;

    try {
      const response = await fetch(`/api/comunidad/chat/${mensajeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        onEnviarMensaje(); // Recargar mensajes
      }
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
    }
  };

  // Función para reportar mensaje
  const reportarMensaje = async (mensajeId: string) => {
    const motivo = prompt('¿Por qué quieres reportar este mensaje?');
    if (!motivo) return;

    try {
      await fetch('/api/comunidad/reportes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenidoId: mensajeId,
          tipoContenido: 'mensaje',
          motivo
        })
      });

      alert('Mensaje reportado. Lo revisaremos pronto.');
    } catch (error) {
      console.error('Error al reportar:', error);
    }
  };

  // Función para silenciar usuario (solo admins)
  const silenciarUsuario = async (usuarioId: string) => {
    if (!confirm('¿Estás seguro de que quieres silenciar a este usuario?')) return;

    try {
      await fetch('/api/comunidad/moderacion/silenciar', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarioId })
      });

      alert('Usuario silenciado temporalmente.');
    } catch (error) {
      console.error('Error al silenciar usuario:', error);
    }
  };

  const mensajesFiltrados = grupoId 
    ? (Array.isArray(mensajes) ? mensajes.filter(m => m.grupoId === grupoId) : [])
    : (Array.isArray(mensajes) ? mensajes.filter(m => !m.grupoId) : []);

  return (
  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 h-96 flex flex-col">
      {/* Header del chat */}
  <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {grupoId ? 'Chat del Grupo' : 'Chat General'}
          </h3>
          <button
            onClick={() => setMostrarUsuarios(!mostrarUsuarios)}
            className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FaUsers className="h-4 w-4" />
            <span>{(Array.isArray(usuariosEnLinea) ? usuariosEnLinea.filter(u => estaEnLinea(u.ultimaActividad)) : []).length} en línea</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSilenciado(!silenciado)}
            className={`p-2 rounded ${
              silenciado 
                ? 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' 
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
            title={silenciado ? 'Activar sonidos' : 'Silenciar sonidos'}
          >
            {silenciado ? <FaVolumeMute className="h-4 w-4" /> : <FaVolumeUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Lista de usuarios en línea */}
      {mostrarUsuarios && (
        <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Usuarios conectados</h4>
          <div className="space-y-1">
            {usuariosEnLinea.map((usuario) => (
              <div key={usuario.id} className="flex items-center space-x-2 text-sm">
                <FaCircle 
                  className={`h-2 w-2 ${
                    estaEnLinea(usuario.ultimaActividad) ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                  }`} 
                />
                <span className="text-gray-700 dark:text-gray-200">{usuario.nombre}</span>
                {estaEnLinea(usuario.ultimaActividad) && (
                  <span className="text-xs text-green-600 dark:text-green-400">En línea</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div 
        ref={mensajesRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {mensajesFiltrados.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-300 py-8">
            <p>No hay mensajes aún.</p>
            <p className="text-sm">¡Sé el primero en escribir algo!</p>
          </div>
        ) : (
          mensajesFiltrados.map((mensaje, indice) => {
            const esPropio = usuarioActual?.id === mensaje.autorId;
            const mostrarAvatar = indice === 0 || 
              mensajesFiltrados[indice - 1].autorId !== mensaje.autorId;

            return (
              <div key={mensaje.id} className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${esPropio ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                  {/* Avatar */}
                  {!esPropio && mostrarAvatar && (
                    <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-xs font-medium shrink-0">
                      {mensaje.autor.firstName[0]}{mensaje.autor.lastName[0]}
                    </div>
                  )}
                  {!esPropio && !mostrarAvatar && (
                    <div className="w-8" />
                  )}

                  {/* Burbuja del mensaje */}
                  <div className="relative group">
                    {!esPropio && mostrarAvatar && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1 px-3">
                        {mensaje.autor.firstName} {mensaje.autor.lastName}
                      </div>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      esPropio 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="text-sm">{mensaje.contenido}</p>
                      {mensaje.editado && (
                        <span className="text-xs opacity-75 italic">editado</span>
                      )}
                    </div>

                    <div className={`flex items-center space-x-2 mt-1 ${
                      esPropio ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500 dark:text-gray-300">
                        {formatearHora(mensaje.fechaEnvio)}
                      </span>

                      {/* Menú de opciones */}
                      {usuarioActual && (
                        <div className="relative opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setMenuAbierto(menuAbierto === mensaje.id ? null : mensaje.id)}
                            className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
                          >
                            <FaEllipsisV className="h-3 w-3" />
                          </button>

                          {menuAbierto === mensaje.id && (
                            <div className={`absolute bottom-full mb-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10 ${
                              esPropio ? 'right-0' : 'left-0'
                            }`}>
                              <div className="py-1">
                                {(esPropio || esAdmin) && (
                                  <button
                                    onClick={() => {
                                      void eliminarMensaje(mensaje.id);
                                      setMenuAbierto(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                                  >
                                    <FaTrash className="h-3 w-3" />
                                    <span>Eliminar</span>
                                  </button>
                                )}
                                
                                {!esPropio && (
                                  <button
                                    onClick={() => {
                                      void reportarMensaje(mensaje.id);
                                      setMenuAbierto(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                                  >
                                    <FaFlag className="h-3 w-3" />
                                    <span>Reportar</span>
                                  </button>
                                )}

                                {esAdmin && !esPropio && (
                                  <button
                                    onClick={() => {
                                      void silenciarUsuario(mensaje.autorId);
                                      setMenuAbierto(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-1 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900"
                                  >
                                    <FaVolumeMute className="h-3 w-3" />
                                    <span>Silenciar</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input para enviar mensajes */}
      {usuarioActual && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <form onSubmit={enviarMensaje} className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              maxLength={1000}
              disabled={enviandoMensaje}
            />
            <button
              type="submit"
              disabled={!nuevoMensaje.trim() || enviandoMensaje}
              className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviandoMensaje ? (
                <FaSpinner className="animate-spin h-4 w-4" />
              ) : (
                <FaPaperPlane className="h-4 w-4" />
              )}
            </button>
          </form>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {nuevoMensaje.length}/1000 caracteres
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-400">
              Presiona Enter para enviar
            </span>
          </div>
        </div>
      )}

      {/* Mensaje si no está autenticado */}
      {!usuarioActual && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            Inicia sesión para participar en el chat
          </p>
        </div>
      )}
    </div>
  );
}