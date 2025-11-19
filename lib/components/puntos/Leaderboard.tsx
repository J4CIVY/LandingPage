'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { Usuario, FiltroPeriodo } from '@/types/puntos';
import apiClient from '@/lib/api-client';
import { 
  FaSeedling, 
  FaSearch, 
  FaRocket, 
  FaHandshake, 
  FaMotorcycle, 
  FaBolt, 
  FaTrophy, 
  FaCrown, 
  FaHandsHelping, 
  FaGem, 
  FaFire,
  FaMedal,
  FaUser
} from 'react-icons/fa';

interface LeaderboardUser {
  posicion: number;
  usuario: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    membershipType: string;
  };
  puntos: number;
  nivel: string;
  cambioSemanal: number;
}

export default function Leaderboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState<FiltroPeriodo>({ periodo: 'Histórico' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void cargarLeaderboard();
  }, [filtro]);

  const cargarLeaderboard = async () => {
    setLoading(true);
    try {
      // NestJS: GET /memberships/leaderboard
      const result = await apiClient.get<{ leaderboard: LeaderboardUser[] }>('/memberships/leaderboard?limit=20');
      const leaderboardData: LeaderboardUser[] = result.leaderboard || [];
          
          // Mapear a formato esperado por el componente
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const usuariosMapeados: any[] = leaderboardData.map(item => ({
            id: item.usuario._id,
            nombre: `${item.usuario.firstName} ${item.usuario.lastName}`,
            puntosTotales: item.puntos,
            nivel: {
              id: 1,
              nombre: item.nivel,
              puntosMinimos: 0,
              puntosMaximos: 999999,
              color: getNivelColor(item.nivel),
              icono: getNivelIcon(item.nivel),
              beneficios: []
            },
            posicionRanking: item.posicion,
            avatar: item.usuario.profileImage || `/api/placeholder/50/50`,
            esAdmin: false
          }));

          setUsuarios(usuariosMapeados);
        } else {
          console.error('Error en respuesta:', result.error);
          setUsuarios([]);
        }
      } else {
        console.error('Error en request:', response.status);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error cargando leaderboard:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const getNivelColor = (nivel: string): string => {
    const colores: Record<string, string> = {
      'Aspirante': '#10B981',
      'Explorador': '#6B7280',
      'Participante': '#3B82F6',
      'Friend': '#8B5CF6',
      'Rider': '#059669',
      'Pro': '#F59E0B',
      'Legend': '#DC2626',
      'Master': '#7C3AED',
      'Volunteer': '#059669',
      'Leader': '#1F2937',
      'Mito BSK': '#DC2626'
    };
    return colores[nivel] || '#10B981';
  };

  const getNivelIcon = (nivel: string) => {
    const iconos: Record<string, ReactElement> = {
      'Aspirante': <FaSeedling className="inline text-green-500 dark:text-green-400" />, 
      'Explorador': <FaSearch className="inline text-gray-500 dark:text-gray-300" />, 
      'Participante': <FaRocket className="inline text-blue-500 dark:text-blue-400" />, 
      'Friend': <FaHandshake className="inline text-purple-500 dark:text-purple-400" />, 
      'Rider': <FaMotorcycle className="inline text-emerald-500 dark:text-emerald-400" />, 
      'Pro': <FaBolt className="inline text-yellow-500 dark:text-yellow-300" />, 
      'Legend': <FaTrophy className="inline text-red-500 dark:text-red-400" />, 
      'Master': <FaCrown className="inline text-purple-700 dark:text-purple-400" />, 
      'Volunteer': <FaHandsHelping className="inline text-emerald-700 dark:text-emerald-400" />, 
      'Leader': <FaGem className="inline text-gray-700 dark:text-gray-300" />, 
      'Mito BSK': <FaFire className="inline text-red-600 dark:text-red-400" />
    };
    return iconos[nivel] || <FaSeedling className="inline text-green-500 dark:text-green-400" />;
  };

  const getMedalIcon = (posicion: number) => {
    const medals = [
      <FaTrophy className="text-yellow-500 dark:text-yellow-400" />, 
      <FaMedal className="text-gray-400 dark:text-gray-300" />, 
      <FaMedal className="text-amber-600 dark:text-amber-400" />
    ];
    return medals[posicion - 1] || `#${posicion}`;
  };

  const getMedalColor = (posicion: number) => {
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-600 dark:to-yellow-400', // Oro
      'bg-gradient-to-r from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-400',    // Plata
      'bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-800 dark:to-amber-400'   // Bronce
    ];
    return colors[posicion - 1] || 'bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-700 dark:to-blue-500';
  };

  const getNivelBadgeColor = (nivel: string) => {
    const colores = {
      'Aspirante': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      'Explorador': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
      'Participante': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      'Friend': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      'Rider': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
      'Pro': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      'Legend': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
      'Master': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      'Volunteer': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
      'Leader': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
      'Mito BSK': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    };
    return colores[nivel as keyof typeof colores] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  };

  const periodos = [
    { value: 'Mensual', label: 'Este mes' },
    { value: 'Anual', label: 'Este año' },
    { value: 'Histórico', label: 'Histórico' }
  ] as const;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
  <div className="bg-white dark:bg-slate-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
  <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4 sm:mb-0 flex items-center gap-2">
          <FaTrophy className="text-yellow-500 dark:text-yellow-400" />
          Ranking de Miembros
        </h3>
        
        {/* Filtro de periodo */}
        <div className="flex gap-2">
          {periodos.map((periodo) => (
            <button
              key={periodo.value}
              onClick={() => setFiltro({ periodo: periodo.value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filtro.periodo === periodo.value
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {periodo.label}
            </button>
          ))}
        </div>
      </div>

      {usuarios.length > 0 ? (
        <div className="space-y-4">
          {/* Top 3 destacado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {usuarios.slice(0, 3).map((usuario) => (
              <div
                key={usuario.id}
                className={`${getMedalColor(usuario.posicionRanking)} rounded-xl p-6 text-white text-center relative overflow-hidden dark:border dark:border-slate-800`}
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-10 -skew-x-12 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-2">
                    {getMedalIcon(usuario.posicionRanking)}
                  </div>
                  
                  <div className="mb-3">
                    {usuario.avatar ? (
                      <img
                        src={usuario.avatar}
                        alt={usuario.nombre}
                        className="w-16 h-16 rounded-full mx-auto object-cover border-4 border-white/30"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0Y5RkFGQiIvPjxwYXRoIGQ9Ik0zMiAzMkMzNS4zMTM3IDMyIDM4IDI5LjMxMzcgMzggMjZDMzggMjIuNjg2MyAzNS4zMTM3IDIwIDMyIDIwQzI4LjY4NjMgMjAgMjYgMjIuNjg2MyAyNiAyNkMyNiAyOS4zMTM3IDI4LjY4NjMgMzIgMzIgMzJaIiBmaWxsPSIjOUI5QkE0Ii8+PHBhdGggZD0iTTQ0IDQyQzQ0IDM4IDQwIDM0IDMyIDM0QzI0IDM0IDIwIDM4IDIwIDQyVjQ0SDQ0VjQyWiIgZmlsbD0iIzlCOUJBNCIvPjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto bg-white/30 flex items-center justify-center text-2xl">
                        <FaUser className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1 text-white">
                    {usuario.nombre}
                  </h4>
                  
                  {usuario.alias && (
                    <p className="text-sm opacity-90 mb-2">
                      @{usuario.alias}
                    </p>
                  )}
                  
                  <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
                    <FaMotorcycle className="text-white" />
                    {usuario.puntosTotales.toLocaleString()}
                  </div>
                  
                  <div className="text-sm opacity-90">
                    {usuario.nivel.icono} {usuario.nivel.nombre}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lista completa */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
              <h4 className="font-semibold text-gray-800 dark:text-white">Ranking completo</h4>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Posición */}
                    <div className="w-12 text-center">
                      {usuario.posicionRanking <= 3 ? (
                        <span className="text-2xl">
                          {getMedalIcon(usuario.posicionRanking)}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                          #{usuario.posicionRanking}
                        </span>
                      )}
                    </div>

                    {/* Avatar y nombre */}
                    <div className="flex items-center gap-3">
                      {usuario.avatar ? (
                        <img
                          src={usuario.avatar}
                          alt={usuario.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0Y5RkFGQiIvPjxwYXRoIGQ9Ik0yMCAyMEMyMi4yMDkxIDIwIDI0IDE4LjIwOTEgMjQgMTZDMjQgMTMuNzkwOSAyMi4yMDkxIDEyIDIwIDEyQzE3Ljc5MDkgMTIgMTYgMTMuNzkwOSAxNiAxNkMxNiAxOC4yMDkxIDE3Ljc5MDkgMjAgMjAgMjBaIiBmaWxsPSIjOUI5QkE0Ii8+PHBhdGggZD0iTTI4IDI2QzI4IDI0IDI2IDIyIDIwIDIyQzE0IDIyIDEyIDI0IDEyIDI2VjI4SDI4VjI2WiIgZmlsbD0iIzlCOUJBNCIvPjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium text-gray-800 dark:text-slate-100">
                          {usuario.nombre}
                        </div>
                        {usuario.alias && (
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            @{usuario.alias}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nivel y puntos */}
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getNivelBadgeColor(usuario.nivel.nombre)} dark:bg-opacity-80 dark:text-opacity-90`}>
                      {usuario.nivel.icono} {usuario.nivel.nombre}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <FaMotorcycle className="text-blue-600 dark:text-blue-400" />
                        {usuario.puntosTotales.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        puntos
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas del periodo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {usuarios.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Miembros activos
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <FaMotorcycle />
                {usuarios[0]?.puntosTotales.toLocaleString() || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Puntos del líder
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2">
                <FaMotorcycle />
                {Math.round(usuarios.reduce((sum, u) => sum + u.puntosTotales, 0) / usuarios.length).toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Promedio de puntos
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FaTrophy className="text-6xl mb-4 text-yellow-500 dark:text-yellow-400 mx-auto" />
          <h4 className="text-lg font-semibold text-gray-600 dark:text-slate-200 mb-2">
            No hay datos disponibles
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron miembros para el periodo seleccionado
          </p>
        </div>
      )}
    </div>
  );
}