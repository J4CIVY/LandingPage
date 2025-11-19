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

import { FaMotorcycle, FaTrophy, FaGift, FaChartBar, FaMedal, FaCog } from 'react-icons/fa';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      void cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const apiClient = (await import('@/lib/api-client')).default;
      
      // Cargar datos de gamificación
      const gamificationResult = await apiClient.get('/users/gamification') as GamificationData;
      setGamificationData(gamificationResult);

      // Cargar recompensas disponibles
      const recompensasResult = await apiClient.get('/community/rewards') as RealRecompensa[];
      setRecompensas(recompensasResult || []);
      
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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !gamificationData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
          <button 
            onClick={cargarDatos}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post('/community/rewards/redeem', {
        recompensaId: recompensaId,
        userId: user.id
      });

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <FaMotorcycle className="text-blue-600 dark:text-blue-400" /> Puntos y Recompensas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-8 ">
          <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setTabActiva(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'bg-blue-600 dark:bg-blue-700 text-white border-b-2 border-blue-600 dark:border-blue-700'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 ">
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
                    <div className="text-6xl mb-4">
                      <FaGift className="mx-auto text-pink-500 dark:text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      No hay recompensas disponibles
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
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