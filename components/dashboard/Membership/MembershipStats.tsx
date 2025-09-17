import { FaCalendarAlt, FaMedal, FaSync, FaTrophy, FaCrown, FaUsers, FaSpinner } from 'react-icons/fa';
import { useUserStats } from '@/hooks/useUserStats';

interface User {
  firstName: string;
  lastName: string;
  membershipType: string;
  membershipNumber?: string;
  joinDate?: Date;
  createdAt?: Date;
}

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface MembershipStatsProps {
  user: User;
  membershipData: MembershipData | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  earned: boolean;
}

export default function MembershipStats({ user, membershipData }: MembershipStatsProps) {
  const { stats, loading, error } = useUserStats();
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaTrophy className="w-5 h-5 text-yellow-500" />
          Estadísticas Personales
        </h3>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaTrophy className="w-5 h-5 text-yellow-500" />
          Estadísticas Personales
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  // Calcular tiempo como miembro usando datos reales
  const calculateMembershipDuration = () => {
    if (!stats.memberSince) {
      return '0 días';
    }
    
    try {
      const joinDateObj = new Date(stats.memberSince);
      if (isNaN(joinDateObj.getTime())) {
        return '0 días';
      }
      
      const diffDays = stats.daysSinceJoining;
      
      if (diffDays < 30) {
        return `${diffDays} días`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} mes${months !== 1 ? 'es' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        if (remainingMonths === 0) {
          return `${years} año${years !== 1 ? 's' : ''}`;
        }
        return `${years} año${years !== 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`;
      }
    } catch (error) {
      console.error('Error calculating membership duration:', error);
      return '0 días';
    }
  };

  // Calcular número de renovaciones basado en los datos
  const calculateRenewals = () => {
    // Por ahora, estimamos basándonos en el tiempo como miembro
    // En el futuro se puede agregar un campo específico en la base de datos
    const years = Math.floor(stats.daysSinceJoining / 365);
    return Math.max(0, years);
  };

  // Insignias/logros basados en datos reales
  const badges: Badge[] = [
    {
      id: 'first-renewal',
      name: 'Primera Renovación',
      description: 'Renovaste tu membresía por primera vez',
      icon: FaSync,
      color: 'text-blue-500',
      earned: calculateRenewals() >= 1
    },
    {
      id: 'loyal-member',
      name: 'Miembro Leal',
      description: 'Más de 1 año como miembro',
      icon: FaMedal,
      color: 'text-gold-500',
      earned: stats.daysSinceJoining >= 365
    },
    {
      id: 'event-enthusiast',
      name: 'Entusiasta de Eventos',
      description: 'Participaste en más de 10 eventos',
      icon: FaCalendarAlt,
      color: 'text-green-500',
      earned: stats.eventsAttended >= 10
    },
    {
      id: 'community-leader',
      name: 'Líder Comunitario',
      description: 'Miembro destacado de la comunidad',
      icon: FaCrown,
      color: 'text-purple-500',
      earned: user.membershipType === 'pro' || user.membershipType === 'pro-duo'
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaTrophy className="w-5 h-5 text-yellow-500" />
        Estadísticas Personales
      </h3>

      {/* Estadísticas principales usando datos reales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {calculateMembershipDuration()}
          </div>
          <p className="text-sm text-blue-700">Como miembro</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {calculateRenewals()}
          </div>
          <p className="text-sm text-green-700">Renovaciones</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.eventsAttended}
          </div>
          <p className="text-sm text-purple-700">Eventos</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {stats.totalPoints}
          </div>
          <p className="text-sm text-yellow-700">Puntos</p>
        </div>
      </div>

      {/* Insignias/Logros */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaMedal className="w-4 h-4 text-yellow-500" />
          Logros Desbloqueados ({earnedBadges.length}/{badges.length})
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  badge.earned
                    ? 'bg-white border-gray-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BadgeIcon 
                    className={`w-4 h-4 ${badge.earned ? badge.color : 'text-gray-400'}`} 
                  />
                  <span className={`text-sm font-medium ${
                    badge.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </span>
                </div>
                <p className={`text-xs ${
                  badge.earned ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking real */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaUsers className="w-4 h-4 text-blue-500" />
          Tu Posición
        </h4>
        
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
          <div className="text-xl font-bold text-indigo-600 mb-1">
            #{stats.ranking.position || 'N/A'}
          </div>
          <p className="text-sm text-indigo-700 mb-2">
            En el ranking general
          </p>
          <p className="text-xs text-indigo-600">
            {stats.ranking.totalUsers > 0 
              ? `Entre ${stats.ranking.totalUsers} miembros` 
              : '¡Sigue participando para subir posiciones!'
            }
          </p>
        </div>
      </div>

      {/* Progreso hacia siguiente nivel real */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Progreso del Nivel</h4>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{stats.currentLevel} {stats.levelIcon}</span>
            <span>{Math.round(stats.levelProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(stats.levelProgress)}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {stats.levelProgress >= 100 
            ? '¡Has alcanzado el nivel máximo!' 
            : `${stats.nextLevelPoints - stats.totalPoints} puntos para el siguiente nivel`
          }
        </p>
      </div>
    </div>
  );
}