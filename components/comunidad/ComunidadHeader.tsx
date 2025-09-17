'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaFilter, FaSearch, FaSpinner } from 'react-icons/fa';
import { GrupoInteres } from '@/types/comunidad';

interface EstadisticasComunidad {
  hoy: {
    publicaciones: number;
    mensajes: number;
    usuarios: number;
  };
  general: {
    miembrosActivos: number;
    gruposActivos: number;
    totalPublicaciones: number;
    totalMensajes: number;
  };
  cambios: {
    publicaciones: number;
    mensajes: number;
  };
}

interface ComunidadHeaderProps {
  onCrearPublicacion: () => void;
  grupoSeleccionado: string | null;
  grupos: GrupoInteres[];
  onSeleccionarGrupo: (grupoId: string | null) => void;
}

export default function ComunidadHeader({
  onCrearPublicacion,
  grupoSeleccionado,
  grupos,
  onSeleccionarGrupo
}: ComunidadHeaderProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState<EstadisticasComunidad | null>(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);

  const grupoActual = grupoSeleccionado 
    ? grupos.find(g => g.id === grupoSeleccionado)
    : null;

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setCargandoEstadisticas(true);
      const response = await fetch('/api/comunidad/estadisticas', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.datos);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Encabezado principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {grupoActual ? `Grupo: ${grupoActual.nombre}` : 'Comunidad BSKMT'}
          </h1>
          <p className="text-lg text-gray-600">
            {grupoActual 
              ? grupoActual.descripcion
              : 'Conéctate, comparte y crece junto a la familia del motoclub'
            }
          </p>
          {grupoActual && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <FaUsers className="mr-1" />
              <span>{grupoActual.miembros.length} miembros</span>
            </div>
          )}
        </div>

        {/* Botón crear publicación */}
        <div className="flex flex-col sm:flex-row gap-3">
          {grupoSeleccionado && (
            <button
              onClick={() => onSeleccionarGrupo(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Ver todas las publicaciones
            </button>
          )}
          <button
            onClick={onCrearPublicacion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <FaPlus className="text-sm" />
            <span>Crear Publicación</span>
          </button>
        </div>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar en publicaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Botón de filtros */}
          <div className="relative">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FaFilter className="h-4 w-4" />
              <span>Filtros</span>
            </button>

            {/* Dropdown de filtros */}
            {mostrarFiltros && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Filtrar por grupo</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="grupo"
                        checked={!grupoSeleccionado}
                        onChange={() => onSeleccionarGrupo(null)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Todas las publicaciones
                      </span>
                    </label>
                    
                    {grupos.map((grupo) => (
                      <label key={grupo.id} className="flex items-center">
                        <input
                          type="radio"
                          name="grupo"
                          checked={grupoSeleccionado === grupo.id}
                          onChange={() => onSeleccionarGrupo(grupo.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <span className="mr-2">{grupo.icono}</span>
                          {grupo.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtros activos */}
        {(grupoSeleccionado || busqueda) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {grupoSeleccionado && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Grupo: {grupoActual?.nombre}
                <button
                  onClick={() => onSeleccionarGrupo(null)}
                  className="ml-1 h-4 w-4 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {busqueda && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Búsqueda: "{busqueda}"
                <button
                  onClick={() => setBusqueda('')}
                  className="ml-1 h-4 w-4 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      {!grupoSeleccionado && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          {cargandoEstadisticas ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          ) : estadisticas ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas.hoy.publicaciones}
                </div>
                <div className="text-sm text-gray-600">Publicaciones hoy</div>
                {estadisticas.cambios.publicaciones !== 0 && (
                  <div className={`text-xs mt-1 ${
                    estadisticas.cambios.publicaciones > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {estadisticas.cambios.publicaciones > 0 ? '+' : ''}
                    {estadisticas.cambios.publicaciones}% vs ayer
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {estadisticas.general.miembrosActivos}
                </div>
                <div className="text-sm text-gray-600">Miembros activos</div>
                <div className="text-xs text-gray-500 mt-1">Últimos 7 días</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {estadisticas.general.gruposActivos}
                </div>
                <div className="text-sm text-gray-600">Grupos activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {estadisticas.hoy.mensajes}
                </div>
                <div className="text-sm text-gray-600">Mensajes hoy</div>
                {estadisticas.cambios.mensajes !== 0 && (
                  <div className={`text-xs mt-1 ${
                    estadisticas.cambios.mensajes > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {estadisticas.cambios.mensajes > 0 ? '+' : ''}
                    {estadisticas.cambios.mensajes}% vs ayer
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">--</div>
                <div className="text-sm text-gray-600">Publicaciones hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">--</div>
                <div className="text-sm text-gray-600">Miembros activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">--</div>
                <div className="text-sm text-gray-600">Grupos activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">--</div>
                <div className="text-sm text-gray-600">Mensajes hoy</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}