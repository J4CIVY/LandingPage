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

// Niveles del sistema para mapear string a objeto
const NIVELES: Nivel[] = [
  {
    id: 1,
    nombre: "Novato",
    puntosMinimos: 0,
    puntosMaximos: 149,
    color: "#CD7F32",
    icono: "🌱",
    beneficios: ["Acceso básico", "Eventos principiantes"]
  },
  {
    id: 2,
    nombre: "Bronce",
    puntosMinimos: 150,
    puntosMaximos: 349,
    color: "#CD7F32",
    icono: "🥉",
    beneficios: ["Eventos intermedios", "Descuento 5%"]
  },
  {
    id: 3,
    nombre: "Plata",
    puntosMinimos: 350,
    puntosMaximos: 749,
    color: "#C0C0C0",
    icono: "🥈",
    beneficios: ["Eventos avanzados", "Descuento 10%"]
  },
  {
    id: 4,
    nombre: "Oro",
    puntosMinimos: 750,
    puntosMaximos: 1499,
    color: "#FFD700",
    icono: "🥇",
    beneficios: ["Eventos premium", "Descuento 15%"]
  },
  {
    id: 5,
    nombre: "Avanzado",
    puntosMinimos: 1500,
    puntosMaximos: 2999,
    color: "#4B0082",
    icono: "💎",
    beneficios: ["Eventos VIP", "Descuento 20%"]
  },
  {
    id: 6,
    nombre: "Experto",
    puntosMinimos: 3000,
    puntosMaximos: 4999,
    color: "#8A2BE2",
    icono: "⭐",
    beneficios: ["Acceso total", "Descuento 25%"]
  },
  {
    id: 7,
    nombre: "Leyenda",
    puntosMinimos: 5000,
    puntosMaximos: 999999,
    color: "#00BFFF",
    icono: "👑",
    beneficios: ["Acceso exclusivo", "Descuento 30%"]
  }
];

// Función helper para obtener objeto Nivel desde string
const obtenerNivelPorNombre = (nombreNivel: string): Nivel => {
  return NIVELES.find(n => n.nombre === nombreNivel) || NIVELES[0];
};

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

  const tabs = [
    { id: 'recompensas', label: 'Recompensas', icon: '🎁' },
    { id: 'historial', label: 'Historial', icon: '📊' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
    { id: 'logros', label: 'Logros', icon: '🏅' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : [])
  ];

  // Convertir datos de gamificación al formato esperado por los componentes
  const usuarioCompatible = {
    id: user.id,
    nombre: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: `/api/placeholder/80/80`,
    puntosTotales: gamificationData.stats.totalPoints,
    puntosDisponibles: gamificationData.stats.totalPoints,
    nivel: obtenerNivelPorNombre(gamificationData.level.current),
    ranking: gamificationData.ranking.position,
    posicionRanking: gamificationData.ranking.position,
    totalUsuarios: gamificationData.ranking.totalUsers,
    eventosAsistidos: gamificationData.stats.eventsAttended,
    fechaRegistro: user.createdAt || new Date().toISOString(),
    esAdmin: isAdmin,
    racha: gamificationData.stats.currentStreak,
    progresoNivel: gamificationData.level.progress
  };

  const handleCanje = async (recompensaId: string, costoPuntos: number) => {
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
                        onCanje={() => handleCanje(recompensa._id, recompensa.puntosRequeridos)}
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