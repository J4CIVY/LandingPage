'use client';

import { useState, type FormEvent } from 'react';
import { 
  FaUsers, 
  FaPlus, 
  FaTimes, 
  FaLock, 
  FaSpinner,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { GrupoInteres, FormularioGrupo, EstadoCarga } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';

interface GruposInteresProps {
  grupos: GrupoInteres[];
  usuarioActual: IUser | null;
  grupoSeleccionado: string | null;
  onSeleccionarGrupo: (grupoId: string | null) => void;
  onActualizarGrupos: () => void;
  cargando: boolean;
  error: string | null;
}

export default function GruposInteres({
  grupos,
  usuarioActual,
  grupoSeleccionado,
  onSeleccionarGrupo,
  onActualizarGrupos,
  cargando,
  error
}: GruposInteresProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoGrupo, setEditandoGrupo] = useState<GrupoInteres | null>(null);
  const [formulario, setFormulario] = useState<FormularioGrupo>({
    nombre: '',
    descripcion: '',
    icono: '🏍️',
    esPrivado: false
  });
  const [estado, setEstado] = useState<EstadoCarga>({
    cargando: false,
    error: null,
    exito: false
  });
  const [gruposCargandoAccion, setGruposCargandoAccion] = useState<Set<string>>(new Set());

  const iconosDisponibles = [
    '🏍️', '🏁', '⚡', '🔥', '🛣️', '🌟', '🎯', '💪', 
    '🚀', '⚙️', '🏆', '🎸', '📸', '🍺', '🌮', '🎉'
  ];

  const esAdmin = usuarioActual?.role === 'admin' || usuarioActual?.role === 'super-admin';

  // Función para manejar cambios en el formulario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manejarCambioFormulario = (campo: keyof FormularioGrupo, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  // Función para crear/editar grupo
  const guardarGrupo = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formulario.nombre.trim() || !formulario.descripcion.trim()) {
      setEstado(prev => ({ ...prev, error: 'Nombre y descripción son obligatorios' }));
      return;
    }

    setEstado({ cargando: true, error: null, exito: false });

    try {
      const url = editandoGrupo 
        ? `/api/comunidad/grupos/${editandoGrupo.id}`
        : '/api/comunidad/grupos';
      
      const method = editandoGrupo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formulario)
      });

      if (response.ok) {
        onActualizarGrupos();
        setMostrarFormulario(false);
        setEditandoGrupo(null);
        setFormulario({
          nombre: '',
          descripcion: '',
          icono: '🏍️',
          esPrivado: false
        });
        setEstado({ cargando: false, error: null, exito: true });
      } else {
        const errorData = await response.json();
        setEstado({
          cargando: false,
          error: errorData.mensaje || 'Error al guardar el grupo',
          exito: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setEstado({
        cargando: false,
        error: error instanceof Error ? error.message : 'Error al guardar el grupo',
        exito: false
      });
    }
  };

  // Función para unirse/salir de un grupo
  const toggleMiembroGrupo = async (grupoId: string, esmiembro: boolean) => {
    if (!usuarioActual) return;

    setGruposCargandoAccion(prev => new Set(prev).add(grupoId));

    try {
      const response = await fetch(`/api/comunidad/grupos/${grupoId}/miembros`, {
        method: esmiembro ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onActualizarGrupos();
      }
    } catch (error) {
      console.error('Error al cambiar membresía:', error);
    } finally {
      setGruposCargandoAccion(prev => {
        const nuevo = new Set(prev);
        nuevo.delete(grupoId);
        return nuevo;
      });
    }
  };

  // Función para eliminar grupo
  const eliminarGrupo = async (grupoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) return;

    try {
      const response = await fetch(`/api/comunidad/grupos/${grupoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        if (grupoSeleccionado === grupoId) {
          onSeleccionarGrupo(null);
        }
        onActualizarGrupos();
      }
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
    }
  };

  // Función para iniciar edición
  const iniciarEdicion = (grupo: GrupoInteres) => {
    setEditandoGrupo(grupo);
    setFormulario({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      icono: grupo.icono,
      esPrivado: grupo.esPrivado
    });
    setMostrarFormulario(true);
  };

  // Función para cancelar formulario
  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setEditandoGrupo(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      icono: '🏍️',
      esPrivado: false
    });
    setEstado({ cargando: false, error: null, exito: false });
  };

  return (
  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Grupos de Interés
        </h3>
        {esAdmin && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-800"
          >
            <FaPlus className="h-3 w-3" />
            <span>Crear</span>
          </button>
        )}
      </div>

      {/* Formulario crear/editar grupo */}
      {mostrarFormulario && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {editandoGrupo ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
            </h4>
            <button
              onClick={cancelarFormulario}
              className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
              aria-label="Cancelar formulario"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={guardarGrupo} className="space-y-4">
            {estado.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-600 text-sm">{estado.error}</p>
              </div>
            )}

            {/* Selección de icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Icono del grupo
              </label>
              <div className="grid grid-cols-8 gap-2">
                {iconosDisponibles.map((icono) => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => manejarCambioFormulario('icono', icono)}
                    className={`p-2 text-lg rounded border-2 ${
                      formulario.icono === icono
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Nombre del grupo
              </label>
              <input
                id="nombre"
                type="text"
                value={formulario.nombre}
                onChange={(e) => manejarCambioFormulario('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                placeholder="Ej: Aventureros de Montaña"
                maxLength={100}
                disabled={estado.cargando}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={formulario.descripcion}
                onChange={(e) => manejarCambioFormulario('descripcion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Describe de qué trata este grupo..."
                maxLength={500}
                disabled={estado.cargando}
              />
            </div>

            {/* Privacidad */}
            <div className="flex items-center">
              <input
                id="esPrivado"
                type="checkbox"
                checked={formulario.esPrivado}
                onChange={(e) => manejarCambioFormulario('esPrivado', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                disabled={estado.cargando}
              />
              <label htmlFor="esPrivado" className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Grupo privado (solo por invitación)
              </label>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelarFormulario}
                disabled={estado.cargando}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={estado.cargando}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                {estado.cargando && <FaSpinner className="animate-spin h-4 w-4" />}
                <span>{editandoGrupo ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de grupos */}
      {cargando ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={onActualizarGrupos}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
          >
            Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-300">
          <FaUsers className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
          <p>No hay grupos creados aún.</p>
          {esAdmin && (
            <p className="text-sm">¡Crea el primer grupo para la comunidad!</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map((grupo) => {
            const esmiembro = usuarioActual ? grupo.miembros.includes(usuarioActual.id) : false;
            const esAdminGrupo = usuarioActual?.id === grupo.adminId;
            const puedeAcceder = !grupo.esPrivado || esmiembro || esAdmin;
            
            return (
              <div
                key={grupo.id}
                className={`border rounded-lg p-4 cursor-pointer ${
                  grupoSeleccionado === grupo.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
                onClick={() => puedeAcceder ? onSeleccionarGrupo(grupo.id) : null}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{grupo.icono}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{grupo.nombre}</h4>
                        {grupo.esPrivado && (
                          <FaLock className="h-3 w-3 text-gray-400 dark:text-gray-300" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {grupo.descripcion}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-300">
                        <span className="flex items-center">
                          <FaUsers className="h-3 w-3 mr-1" />
                          {grupo.miembros.length} miembros
                        </span>
                        {esAdminGrupo && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            Administrador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Botones de administración */}
                    {(esAdminGrupo || esAdmin) && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            iniciarEdicion(grupo);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar grupo"
                        >
                          <FaEdit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void eliminarGrupo(grupo.id);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar grupo"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Botón unirse/salir */}
                    {usuarioActual && puedeAcceder && !esAdminGrupo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleMiembroGrupo(grupo.id, esmiembro);
                        }}
                        disabled={gruposCargandoAccion.has(grupo.id)}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          esmiembro
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                        }`}
                      >
                        {gruposCargandoAccion.has(grupo.id) ? (
                          <FaSpinner className="animate-spin h-3 w-3" />
                        ) : esmiembro ? (
                          'Salir'
                        ) : (
                          'Unirse'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón ver todas las publicaciones */}
      {grupoSeleccionado && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => onSeleccionarGrupo(null)}
            className="w-full px-4 py-2 text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
          >
            Ver todas las publicaciones
          </button>
        </div>
      )}
    </div>
  );
}