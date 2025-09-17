'use client';

import { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaStar, 
  FaMedal, 
  FaFire, 
  FaComment, 
  FaHeart, 
  FaCalendarAlt,
  FaChevronUp,
  FaChevronDown,
  FaInfoCircle
} from 'react-icons/fa';
import { UsuarioRanking } from '@/types/comunidad';
import { IUser } from '@/lib/models/User';

interface RankingProps {
  usuarios: UsuarioRanking[];
  usuarioActual: IUser | null;
}

interface InsigniaInfo {
  icono: string;
  color: string;
  descripcion: string;
  requisitos?: string;
}

interface NivelInfo {
  color: string;
  minPuntos: number;
  descripcion?: string;
  beneficios?: string[];
}

interface ConfiguracionGamificacion {
  insignias: Record<string, InsigniaInfo>;
  niveles: Record<string, NivelInfo>;
  sistemaPuntos: Record<string, { puntos: number; descripcion: string }>;
}

export default function Ranking({
  usuarios,
  usuarioActual
}: RankingProps) {
  const [vistaActual, setVistaActual] = useState<'ranking' | 'insignias' | 'niveles'>('ranking');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [configuracion, setConfiguracion] = useState<ConfiguracionGamificacion | null>(null);
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);

  // Cargar configuración de gamificación
  const cargarConfiguracion = async () => {
    try {
      setCargandoConfiguracion(true);
      const response = await fetch('/api/comunidad/gamificacion', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data.datos);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setCargandoConfiguracion(false);
    }
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  // Usar configuración cargada o valores por defecto
  const insignias = configuracion?.insignias || {};
  const nivelesInfo = configuracion?.niveles || {};
  const sistemaPuntos = configuracion?.sistemaPuntos || {};

  // Ordenar usuarios por puntos totales
  const usuariosOrdenados = [...usuarios].sort((a, b) => b.puntos.total - a.puntos.total);
  
  // Mostrar solo top 10 por defecto
  const usuariosMostrados = mostrarTodos ? usuariosOrdenados : usuariosOrdenados.slice(0, 10);
  
  // Encontrar posición del usuario actual
  const posicionUsuarioActual = usuarioActual 
    ? usuariosOrdenados.findIndex(u => u.id === usuarioActual.id) + 1
    : 0;

  // Función para obtener el color de la posición
  const getColorPosicion = (posicion: number) => {
    if (posicion === 1) return 'text-yellow-600'; // Oro
    if (posicion === 2) return 'text-gray-500'; // Plata
    if (posicion === 3) return 'text-orange-600'; // Bronce
    return 'text-gray-700';
  };

  // Función para obtener el icono de la posición
  const getIconoPosicion = (posicion: number) => {
    if (posicion === 1) return <FaTrophy className="h-5 w-5 text-yellow-500" />;
    if (posicion === 2) return <FaMedal className="h-5 w-5 text-gray-400" />;
    if (posicion === 3) return <FaMedal className="h-5 w-5 text-orange-500" />;
    return <span className="text-sm font-bold text-gray-600">#{posicion}</span>;
  };

  // Función para calcular el progreso al siguiente nivel
  const calcularProgreso = (puntos: number, nivel: string) => {
    const nivelesArray = Object.entries(nivelesInfo).sort((a, b) => b[1].minPuntos - a[1].minPuntos);
    const nivelActualIndex = nivelesArray.findIndex(([nombre]) => nombre === nivel);
    
    if (nivelActualIndex === 0) return 100; // Ya está en el nivel máximo
    
    const siguienteNivel = nivelesArray[nivelActualIndex - 1];
    const nivelActual = nivelesArray[nivelActualIndex];
    
    const puntosParaSiguiente = siguienteNivel[1].minPuntos;
    const puntosNivelActual = nivelActual[1].minPuntos;
    
    const progreso = ((puntos - puntosNivelActual) / (puntosParaSiguiente - puntosNivelActual)) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <FaTrophy className="h-5 w-5 text-yellow-500" />
          <span>Ranking</span>
        </h3>
        <button
          onClick={() => setMostrarInfo(!mostrarInfo)}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Información sobre el sistema de puntos"
        >
          <FaInfoCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Información del sistema de puntos */}
      {mostrarInfo && configuracion && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">¿Cómo se calculan los puntos?</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {Object.entries(sistemaPuntos).map(([accion, info]) => (
              <div key={accion} className="flex items-center space-x-2">
                <FaFire className="h-4 w-4" />
                <span>{info.descripcion}: +{info.puntos} puntos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setVistaActual('ranking')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            vistaActual === 'ranking'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ranking
        </button>
        <button
          onClick={() => setVistaActual('insignias')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            vistaActual === 'insignias'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Insignias
        </button>
        <button
          onClick={() => setVistaActual('niveles')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            vistaActual === 'niveles'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Niveles
        </button>
      </div>

      {/* Tu posición actual */}
      {usuarioActual && posicionUsuarioActual > 0 && vistaActual === 'ranking' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {(usuarioActual.firstName?.[0] || '?')}{(usuarioActual.lastName?.[0] || '?')}
              </div>
              <div>
                <p className="font-medium text-gray-900">Tu posición</p>
                <p className="text-sm text-gray-600">
                  {usuarioActual.firstName} {usuarioActual.lastName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {getIconoPosicion(posicionUsuarioActual)}
                <span className="font-bold text-lg">#{posicionUsuarioActual}</span>
              </div>
              {(() => {
                const usuario = usuariosOrdenados.find(u => u.id === usuarioActual.id);
                return usuario && (
                  <p className="text-sm text-gray-600">
                    {usuario.puntos.total} puntos
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Ranking */}
      {vistaActual === 'ranking' && (
        <div className="space-y-3">
          {usuariosMostrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaTrophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay datos de ranking aún.</p>
              <p className="text-sm">¡Participa en la comunidad para aparecer aquí!</p>
            </div>
          ) : (
            usuariosMostrados.map((usuario, indice) => {
              const posicion = indice + 1;
              const esUsuarioActual = usuarioActual?.id === usuario.id;
              
              return (
                <div
                  key={usuario.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                    esUsuarioActual 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Posición */}
                  <div className="flex items-center justify-center w-8">
                    {getIconoPosicion(posicion)}
                  </div>

                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {(usuario.firstName?.[0] || '?')}{(usuario.lastName?.[0] || '?')}
                  </div>

                  {/* Información del usuario */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 truncate">
                        {usuario.firstName} {usuario.lastName}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        nivelesInfo[usuario.nivel as keyof typeof nivelesInfo]?.color === 'text-purple-600' 
                          ? 'bg-purple-100 text-purple-800'
                          : nivelesInfo[usuario.nivel as keyof typeof nivelesInfo]?.color === 'text-green-600'
                          ? 'bg-green-100 text-green-800'
                          : nivelesInfo[usuario.nivel as keyof typeof nivelesInfo]?.color === 'text-blue-600'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.nivel}
                      </span>
                      {esUsuarioActual && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Tú
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        {/* Desglose de actividad */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <span className="flex items-center">
                        <FaFire className="h-3 w-3 mr-1" />
                        {usuario.contadores?.publicaciones || 0} publicaciones ({usuario.puntos.publicaciones} pts)
                      </span>
                      <span className="flex items-center">
                        <FaComment className="h-3 w-3 mr-1" />
                        {usuario.contadores?.comentarios || 0} comentarios ({usuario.puntos.comentarios} pts)
                      </span>
                      <span className="flex items-center">
                        <FaHeart className="h-3 w-3 mr-1" />
                        {usuario.contadores?.reaccionesRecibidas || 0} reacciones ({usuario.puntos.reaccionesRecibidas} pts)
                      </span>
                      <span className="flex items-center">
                        <FaCalendarAlt className="h-3 w-3 mr-1" />
                        {usuario.contadores?.participacionEventos || 0} eventos ({usuario.puntos.participacionEventos} pts)
                      </span>
                    </div>
                  </div>
                    </div>
                  </div>

                  {/* Puntos totales */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {usuario.puntos.total}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>

                  {/* Insignias */}
                  <div className="flex space-x-1">
                    {usuario.insignias.slice(0, 3).map((insignia, idx) => (
                      <span
                        key={idx}
                        className="text-lg"
                        title={insignia.descripcion}
                      >
                        {insignias[insignia.nombre]?.icono || '🏆'}
                      </span>
                    ))}
                    {usuario.insignias.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{usuario.insignias.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Botón ver más */}
          {usuarios.length > 10 && (
            <button
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className="w-full flex items-center justify-center space-x-2 py-3 text-blue-600 hover:text-blue-700 transition-colors"
            >
              {mostrarTodos ? (
                <>
                  <FaChevronUp className="h-4 w-4" />
                  <span>Ver menos</span>
                </>
              ) : (
                <>
                  <FaChevronDown className="h-4 w-4" />
                  <span>Ver más ({usuarios.length - 10} restantes)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Vista de Insignias */}
      {vistaActual === 'insignias' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Las insignias se otorgan por logros especiales en la comunidad.
          </p>
          
          <div className="grid gap-4">
            {Object.entries(insignias).map(([nombre, info]) => (
              <div key={nombre} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-3xl">{info.icono}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{nombre}</h4>
                  <p className="text-sm text-gray-600">{info.descripcion}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${info.color}`}>
                  Insignia
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista de Niveles */}
      {vistaActual === 'niveles' && (
        <div className="space-y-4">
          {cargandoConfiguracion ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando niveles...</p>
            </div>
          ) : configuracion ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Progresa a través de los niveles acumulando puntos por tu participación.
              </p>
              
              <div className="space-y-4">
                {Object.entries(nivelesInfo).map(([nivel, info]) => {
                  const usuarioActualNivel = usuarioActual && usuariosOrdenados.find(u => u.id === usuarioActual.id);
                  const esNivelActual = usuarioActualNivel?.nivel === nivel;
                  const progreso = usuarioActualNivel ? calcularProgreso(usuarioActualNivel.puntos.total, usuarioActualNivel.nivel) : 0;
                  
                  return (
                    <div
                      key={nivel}
                      className={`p-4 border rounded-lg ${
                        esNivelActual ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${info.color}`}>{nivel}</h4>
                        <span className="text-sm text-gray-600">
                          {info.minPuntos} puntos mínimos
                        </span>
                      </div>
                      
                      {info.descripcion && (
                        <p className="text-sm text-gray-600 mb-2">{info.descripcion}</p>
                      )}
                      
                      {info.beneficios && info.beneficios.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Beneficios:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {info.beneficios.map((beneficio, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {beneficio}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {esNivelActual && usuarioActualNivel && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Tu progreso</span>
                            <span>{usuarioActualNivel.puntos.total} puntos</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se pudo cargar la información de niveles.</p>
              <button
                onClick={cargarConfiguracion}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}