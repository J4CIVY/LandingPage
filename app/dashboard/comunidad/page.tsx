'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';

// Componentes de la comunidad
import ComunidadHeader from '@/components/comunidad/ComunidadHeader';
import PublicacionCard from '@/components/comunidad/PublicacionCard';
import PublicacionForm from '@/components/comunidad/PublicacionForm';
import GruposInteres from '@/components/comunidad/GruposInteres';
import ChatComunidad from '@/components/comunidad/ChatComunidad';
import Ranking from '@/components/comunidad/Ranking';

// Tipos
import { Publicacion, GrupoInteres, ChatMensaje, UsuarioRanking, EstadoCarga } from '@/types/comunidad';

export default function ComunidadPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Estados para datos de la comunidad
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [grupos, setGrupos] = useState<GrupoInteres[]>([]);
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  
  // Estados de carga
  const [estadoPublicaciones, setEstadoPublicaciones] = useState<EstadoCarga>({
    cargando: true,
    error: null,
    exito: false
  });
  
  const [estadoGrupos, setEstadoGrupos] = useState<EstadoCarga>({
    cargando: true,
    error: null,
    exito: false
  });
  
  // Estados de UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const [vistaMovil, setVistaMovil] = useState<'muro' | 'chat' | 'ranking'>('muro');

  // Efectos para cargar datos
  useEffect(() => {
    if (isAuthenticated && user) {
      void cargarPublicaciones();
      void cargarGrupos();
      void cargarRanking();
      void cargarMensajes();
    }
  }, [isAuthenticated, user]);

  // Función para cargar publicaciones
  const cargarPublicaciones = async () => {
    try {
      setEstadoPublicaciones(prev => ({ ...prev, cargando: true, error: null }));
      
      const url = grupoSeleccionado 
        ? `/api/comunidad/publicaciones?grupoId=${grupoSeleccionado}`
        : '/api/comunidad/publicaciones';
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPublicaciones(Array.isArray(data.datos) ? data.datos : []);
        setEstadoPublicaciones({ cargando: false, error: null, exito: true });
      } else {
        setPublicaciones([]);
        setEstadoPublicaciones({ 
          cargando: false, 
          error: 'Error al cargar las publicaciones', 
          exito: false 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setPublicaciones([]); // Asegurar que siempre sea un array
      setEstadoPublicaciones({ 
        cargando: false, 
        error: 'Error al cargar las publicaciones', 
        exito: false 
      });
    }
  };

  // Función para cargar grupos
  const cargarGrupos = async () => {
    try {
      setEstadoGrupos(prev => ({ ...prev, cargando: true, error: null }));
      
      const response = await fetch('/api/comunidad/grupos', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGrupos(Array.isArray(data.datos) ? data.datos : []);
        setEstadoGrupos({ cargando: false, error: null, exito: true });
      } else {
        setGrupos([]);
        setEstadoGrupos({ 
          cargando: false, 
          error: 'Error al cargar los grupos', 
          exito: false 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setGrupos([]); // Asegurar que siempre sea un array
      setEstadoGrupos({ 
        cargando: false, 
        error: 'Error al cargar los grupos', 
        exito: false 
      });
    }
  };

  // Función para cargar ranking
  const cargarRanking = async () => {
    try {
      const response = await fetch('/api/comunidad/ranking', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRanking(data.datos?.ranking || []);
      }
    } catch (error) {
      console.error('Error al cargar ranking:', error);
      setRanking([]); // Asegurar que siempre sea un array
    }
  };

  // Función para cargar mensajes del chat
  const cargarMensajes = async () => {
    try {
      const response = await fetch('/api/comunidad/chat', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMensajes(data.datos?.mensajes || []);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setMensajes([]); // Asegurar que siempre sea un array
    }
  };

  // Función para agregar nueva publicación
  const agregarPublicacion = (nuevaPublicacion: Publicacion) => {
    setPublicaciones(prev => [nuevaPublicacion, ...prev]);
    setMostrarFormulario(false);
  };

  // Función para actualizar publicación
  const actualizarPublicacion = (publicacionActualizada: Publicacion) => {
    setPublicaciones(prev => 
      prev.map(pub => 
        pub.id === publicacionActualizada.id ? publicacionActualizada : pub
      )
    );
  };

  // Función para eliminar publicación
  const eliminarPublicacion = (publicacionId: string) => {
    setPublicaciones(prev => prev.filter(pub => pub.id !== publicacionId));
  };

  // Loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center h-96">
          <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-4xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Debes iniciar sesión para acceder a la comunidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la comunidad */}
        <ComunidadHeader 
          onCrearPublicacion={() => setMostrarFormulario(!mostrarFormulario)}
          grupoSeleccionado={grupoSeleccionado}
          grupos={grupos}
          onSeleccionarGrupo={setGrupoSeleccionado}
        />

        {/* Navegación móvil */}
        <div className="lg:hidden mb-6">
          <div className="flex space-x-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow">
            <button
              onClick={() => setVistaMovil('muro')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                vistaMovil === 'muro'
                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Muro
            </button>
            <button
              onClick={() => setVistaMovil('chat')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                vistaMovil === 'chat'
                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setVistaMovil('ranking')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                vistaMovil === 'ranking'
                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Ranking
            </button>
          </div>
        </div>

        {/* Layout principal */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Columna izquierda - Muro de publicaciones */}
          <div className={`lg:col-span-8 ${vistaMovil !== 'muro' ? 'hidden lg:block' : ''}`}>
            {/* Formulario de nueva publicación */}
            {mostrarFormulario && (
              <div className="mb-6">
                <PublicacionForm
                  onPublicar={agregarPublicacion}
                  onCancelar={() => setMostrarFormulario(false)}
                  grupoId={grupoSeleccionado}
                />
              </div>
            )}

            {/* Lista de publicaciones */}
            <div className="space-y-6">
              {estadoPublicaciones.cargando ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-3xl" />
                </div>
              ) : estadoPublicaciones.error ? (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
                  <p className="text-red-600 dark:text-red-300">{estadoPublicaciones.error}</p>
                  <button
                    onClick={cargarPublicaciones}
                    className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    Reintentar
                  </button>
                </div>
              ) : publicaciones.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center shadow">
                  <p className="text-gray-500 dark:text-gray-300 text-lg">
                    {grupoSeleccionado 
                      ? 'No hay publicaciones en este grupo aún.'
                      : 'No hay publicaciones aún.'
                    }
                  </p>
                  <p className="text-gray-400 dark:text-gray-400 mt-2">
                    ¡Sé el primero en publicar algo!
                  </p>
                </div>
              ) : (
                publicaciones.map((publicacion) => (
                  <PublicacionCard
                    key={publicacion.id}
                    publicacion={publicacion}
                    usuarioActual={user}
                    onActualizar={actualizarPublicacion}
                    onEliminar={eliminarPublicacion}
                  />
                ))
              )}
            </div>
          </div>

          {/* Columna derecha - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Grupos de interés */}
            <div className={`${vistaMovil !== 'muro' ? 'hidden lg:block' : ''}`}>
              <GruposInteres
                grupos={grupos}
                usuarioActual={user}
                grupoSeleccionado={grupoSeleccionado}
                onSeleccionarGrupo={setGrupoSeleccionado}
                onActualizarGrupos={cargarGrupos}
                cargando={estadoGrupos.cargando}
                error={estadoGrupos.error}
              />
            </div>

            {/* Chat comunitario */}
            <div className={`${vistaMovil !== 'chat' ? 'hidden lg:block' : ''}`}>
              <ChatComunidad
                mensajes={mensajes}
                usuarioActual={user}
                onEnviarMensaje={cargarMensajes}
                grupoId={grupoSeleccionado}
              />
            </div>

            {/* Ranking */}
            <div className={`${vistaMovil !== 'ranking' ? 'hidden lg:block' : ''}`}>
              <Ranking
                usuarios={ranking}
                usuarioActual={user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}