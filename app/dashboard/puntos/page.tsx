'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PuntosHeader from '@/components/puntos/PuntosHeader';
import ProgresoNivel from '@/components/puntos/ProgresoNivel';
import HistorialPuntos from '@/components/puntos/HistorialPuntos';
import RecompensaCard from '@/components/puntos/RecompensaCard';
import Leaderboard from '@/components/puntos/Leaderboard';
import AdminPanel from '@/components/puntos/AdminPanel';
import NotificacionesToast from '@/components/puntos/NotificacionesToast';
import EstadisticasRapidas from '@/components/puntos/EstadisticasRapidas';
import LogrosUsuario from '@/components/puntos/LogrosUsuario';
import ResumenSemanal from '@/components/puntos/ResumenSemanal';
import { useNotificaciones } from '@/hooks/useNotificacionesPuntos';
import { Nivel } from '@/types/puntos';
import { ReactNode } from 'react';

import { FaSeedling, FaSearch, FaRocket, FaHandshake, FaMotorcycle, FaBolt, FaTrophy, FaCrown, FaHandsHelping, FaGem, FaFire, FaGift, FaChartBar, FaMedal, FaCog } from 'react-icons/fa';

// Niveles del sistema actualizados para alinear con membresías
type NivelConIcono = Omit<Nivel, 'icono'> & { icono: ReactNode };
const NIVELES: NivelConIcono[] = [
  {
    id: 1,
    nombre: "Aspirante",
    puntosMinimos: 0,
    puntosMaximos: 249,
    color: "#10B981",
    icono: <FaSeedling className="inline text-green-500" />,
    beneficios: ["Acceso básico", "Nuevo en la comunidad BSK"]
  },
  {
    id: 2,
    nombre: "Explorador",
    puntosMinimos: 250,
    puntosMaximos: 499,
    color: "#6B7280",
    icono: <FaSearch className="inline text-gray-500" />,
    beneficios: ["Comenzando a participar", "Acceso a eventos básicos"]
  },
  {
    id: 3,
    nombre: "Participante",
    puntosMinimos: 500,
    puntosMaximos: 999,
    color: "#3B82F6",
    icono: <FaRocket className="inline text-blue-500" />,
    beneficios: ["Participante activo", "Crear publicaciones"]
  },
  {
    id: 4,
    nombre: "Friend",
    puntosMinimos: 1000,
    puntosMaximos: 1499,
    color: "#8B5CF6",
    icono: <FaHandshake className="inline text-purple-500" />,
    beneficios: ["Miembro Friend BSK MT", "Eventos gratuitos limitados"]
  },
  {
    id: 5,
    nombre: "Rider",
    puntosMinimos: 1500,
    puntosMaximos: 2999,
    color: "#059669",
    icono: <FaMotorcycle className="inline text-emerald-500" />,
    beneficios: ["Rider activo", "Descuentos en eventos", "Acceso a talleres"]
  },
  {
    id: 6,
    nombre: "Pro",
    puntosMinimos: 3000,
    puntosMaximos: 8999,
    color: "#F59E0B",
    icono: <FaBolt className="inline text-yellow-500" />,
    beneficios: ["Motociclista experimentado", "Equipamiento gratuito", "Eventos exclusivos"]
  },
  {
    id: 7,
    nombre: "Legend",
    puntosMinimos: 9000,
    puntosMaximos: 17999,
    color: "#DC2626",
    icono: <FaTrophy className="inline text-red-500" />,
    beneficios: ["Leyenda de la comunidad", "Mentoría", "Eventos VIP"]
  },
  {
    id: 8,
    nombre: "Master",
    puntosMinimos: 18000,
    puntosMaximos: 24999,
    color: "#7C3AED",
    icono: <FaCrown className="inline text-purple-700" />,
    beneficios: ["Maestro del motociclismo", "Todos los beneficios", "Acceso completo"]
  },
  {
    id: 9,
    nombre: "Volunteer",
    puntosMinimos: 25000,
    puntosMaximos: 39999,
    color: "#059669",
    icono: <FaHandsHelping className="inline text-emerald-700" />,
    beneficios: ["Voluntario comprometido", "Puntos extra", "Reconocimiento especial"]
  },
  {
    id: 10,
    nombre: "Leader",
    puntosMinimos: 40000,
    puntosMaximos: 59999,
    color: "#1F2937",
    icono: <FaGem className="inline text-gray-700" />,
    beneficios: ["Líder de la comunidad", "Liderazgo de proyectos", "Toma de decisiones"]
  },
  {
    id: 11,
    nombre: "Mito BSK",
    puntosMinimos: 60000,
    puntosMaximos: 999999,
    color: "#DC2626",
    icono: <FaFire className="inline text-red-600" />,
    beneficios: ["Leyenda viviente del BSK MT", "Máximo reconocimiento", "Estado élite"]
  }
];

// Esta función ya no es necesaria - usamos datos reales de la API

// Función helper para mapear recompensa real a tipo esperado
const mapearRecompensa = (recompensaReal: RealRecompensa) => ({
  id: recompensaReal._id,
  nombre: recompensaReal.nombre,
  descripcion: recompensaReal.descripcion,
  costoPuntos: recompensaReal.puntosRequeridos,
  disponible: recompensaReal.activa && recompensaReal.stock > 0,
  imagen: recompensaReal.imagen || '/api/placeholder/300/200',
  categoria: recompensaReal.categoria as "Producto" | "Servicio" | "Experiencia" | "Descuento",
  stock: recompensaReal.stock,
  nivelMinimo: 1
});

// Interfaces para datos reales
interface GamificationData {
  stats: {
    participationScore: number;
    maxParticipationScore: number;
    totalPoints: number;
    userRank: number;
    totalUsers: number;
    level: string;
    nextLevelPoints: number;
    eventsAttended: number;
    eventsRegistered: number;
    pointsToday: number;
    pointsThisMonth: number;
    pointsThisYear: number;
    levelProgress: number;
    currentStreak: number;
    bestStreak: number;
    activeDays: number;
    rankingChange: number;
    achievements: number;
    recentActivity: {
      lastLogin: string;
      interactions: number;
    };
  };
  level: {
    current: string;
    icon: string;
    color: string;
    points: number;
    nextLevelPoints: number;
    progress: number;
  };
  ranking: {
    position: number;
    totalUsers: number;
    percentile: number;
    change: number;
  };
  nextRewards: any[];
  user: {
    id: string;
    name: string;
    membershipType: string;
    joinDate: string;
  };
}

interface RealRecompensa {
  _id: string;
  nombre: string;
  descripcion: string;
  puntosRequeridos: number;
  tipo: string;
  activa: boolean;
  stock: number;
  stockInicial: number;
  categoria: string;
  fechaCreacion: string;
  imagen?: string;
}

export default function PuntosPage() {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [recompensas, setRecompensas] = useState<RealRecompensa[]>([]);
  const [tabActiva, setTabActiva] = useState<'recompensas' | 'historial' | 'ranking' | 'logros' | 'admin'>('recompensas');
  const [loading, setLoading] = useState(true);
  
  // Hook de notificaciones
  const { 
    notificaciones, 
    eliminarNotificacion, 
    notificarExito, 
    notificarError 
  } = useNotificaciones();

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de gamificación
      const gamificationResponse = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (gamificationResponse.ok) {
        const gamificationResult = await gamificationResponse.json();
        if (gamificationResult.success) {
          setGamificationData(gamificationResult.data);
        }
      }

      // Cargar recompensas disponibles
      const recompensasResponse = await fetch('/api/rewards', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (recompensasResponse.ok) {
        const recompensasResult = await recompensasResponse.json();
        if (recompensasResult.success) {
          setRecompensas(recompensasResult.data || []);
        }
      }
      
      // Notificación de bienvenida
      if (gamificationData?.stats) {
        setTimeout(() => {
          notificarExito(
            '¡Bienvenido!', 
            `Hola ${user?.firstName}, tienes ${gamificationData.stats.totalPoints} puntos disponibles`
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      notificarError('Error', 'No se pudieron cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !gamificationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
          <button 
            onClick={cargarDatos}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Verificar si el usuario es admin
  const isAdmin = user.email?.includes('admin') || false; // Ajusta según tu lógica de admin

// Importar los íconos al inicio del archivo (ya están importados arriba)
  const tabs = [
    { id: 'recompensas', label: 'Recompensas', icon: <FaGift className="inline text-pink-500" /> },
    { id: 'historial', label: 'Historial', icon: <FaChartBar className="inline text-blue-500" /> },
    { id: 'ranking', label: 'Ranking', icon: <FaTrophy className="inline text-yellow-500" /> },
    { id: 'logros', label: 'Logros', icon: <FaMedal className="inline text-green-500" /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <FaCog className="inline text-gray-700" /> }] : [])
  ];

  // Convertir datos de gamificación al formato esperado por los componentes
  // Usar datos reales de la API en lugar de valores hardcodeados
  const usuarioCompatible = {
    id: user.id,
    nombre: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: `/api/placeholder/80/80`,
    puntosTotales: gamificationData.stats.totalPoints,
    puntosDisponibles: gamificationData.stats.totalPoints,
    nivel: {
      id: 1, // ID genérico, lo importante son los datos reales
      nombre: gamificationData.level.current,
      puntosMinimos: gamificationData.level.points,
      puntosMaximos: gamificationData.level.nextLevelPoints,
      color: gamificationData.level.color,
      icono: gamificationData.level.icon, // Puede ser string o ReactNode según la fuente
      beneficios: [`Nivel ${gamificationData.level.current}`] // Datos reales de la API
    },
    ranking: gamificationData.ranking.position,
    posicionRanking: gamificationData.ranking.position,
    totalUsuarios: gamificationData.ranking.totalUsers,
    eventosAsistidos: gamificationData.stats.eventsAttended,
    fechaRegistro: user.createdAt || new Date().toISOString(),
    esAdmin: isAdmin,
    racha: gamificationData.stats.currentStreak,
    progresoNivel: gamificationData.level.progress
  };

  const handleCanje = async (recompensaId: string, costoPuntos: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recompensaId: recompensaId,
          userId: user.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Actualizar datos locales
          setGamificationData(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              totalPoints: prev.stats.totalPoints - costoPuntos
            }
          } : null);
          
          // Actualizar stock de la recompensa
          setRecompensas(prev => prev.map(r => 
            r._id === recompensaId ? { ...r, stock: r.stock - 1 } : r
          ));
          
          notificarExito(
            '¡Canje exitoso!',
            `Has canjeado la recompensa por ${costoPuntos} puntos`
          );
          
          // Recargar datos para asegurar consistencia
          setTimeout(() => cargarDatos(), 1000);
          
          return true; // Canje exitoso
        } else {
          throw new Error(result.error || 'Error en el canje');
        }
      } else {
        throw new Error('Error del servidor');
      }
    } catch (error) {
      console.error('Error en canje:', error);
      notificarError(
        'Error en canje',
        error instanceof Error ? error.message : 'No se pudo completar el canje'
      );
      return false; // Canje fallido
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏍️ Puntos y Recompensas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acumula puntos con tus actividades y canjéalos por recompensas exclusivas del BSK Motorcycle Team
          </p>
        </div>

        {/* Puntos Header y Progreso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PuntosHeader usuario={usuarioCompatible} />
          <ProgresoNivel usuario={usuarioCompatible} />
        </div>

        {/* Estadísticas rápidas y logros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <EstadisticasRapidas 
            usuarioId={usuarioCompatible.id} 
            puntosActuales={usuarioCompatible.puntosTotales} 
          />
          <LogrosUsuario 
            usuarioId={usuarioCompatible.id} 
            puntosActuales={usuarioCompatible.puntosTotales} 
          />
          <ResumenSemanal 
            usuarioId={usuarioCompatible.id} 
          />
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido de las pestañas */}
          <div className="min-h-[400px]">
            {tabActiva === 'recompensas' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recompensas Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recompensas.map((recompensa) => {
                    const recompensaMapeada = mapearRecompensa(recompensa);
                    return (
                      <RecompensaCard
                        key={recompensa._id}
                        recompensa={recompensaMapeada}
                        usuario={usuarioCompatible}
                        onCanje={handleCanje}
                      />
                    );
                  })}
                </div>
                {recompensas.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No hay recompensas disponibles
                    </h3>
                    <p className="text-gray-500">
                      Pronto tendremos nuevas recompensas para ti
                    </p>
                  </div>
                )}
              </div>
            )}

            {tabActiva === 'historial' && <HistorialPuntos usuarioId={usuarioCompatible.id} />}

            {tabActiva === 'ranking' && <Leaderboard />}

            {tabActiva === 'logros' && (
              <LogrosUsuario 
                usuarioId={usuarioCompatible.id} 
                puntosActuales={usuarioCompatible.puntosTotales} 
              />
            )}

            {tabActiva === 'admin' && usuarioCompatible.esAdmin && <AdminPanel />}
          </div>
        </div>
      </div>
      
      {/* Sistema de notificaciones */}
      <NotificacionesToast 
        notificaciones={notificaciones}
        onEliminar={eliminarNotificacion}
      />
    </div>
  );
}