import { FaCalendarAlt, FaMedal, FaSync, FaTrophy, FaCrown, FaUsers } from 'react-icons/fa';

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
  // Calcular tiempo como miembro
  const calculateMembershipDuration = () => {
    const joinDate = user.joinDate || user.createdAt;
    if (!joinDate) {
      return '0 días';
    }
    
    try {
      const joinDateObj = new Date(joinDate);
      if (isNaN(joinDateObj.getTime())) {
        return '0 días';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joinDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
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

  // Calcular estadísticas simuladas
  const stats = {
    membershipDuration: calculateMembershipDuration(),
    renewalCount: Math.floor(Math.random() * 5) + 1, // Simulado
    eventsAttended: Math.floor(Math.random() * 20) + 5, // Simulado
    benefitsUsed: Math.floor(Math.random() * 15) + 3, // Simulado
  };

  // Insignias/logros simulados
  const badges: Badge[] = [
    {
      id: 'first-renewal',
      name: 'Primera Renovación',
      description: 'Renovaste tu membresía por primera vez',
      icon: FaSync,
      color: 'text-blue-500',
      earned: stats.renewalCount >= 1
    },
    {
      id: 'loyal-member',
      name: 'Miembro Leal',
      description: 'Más de 1 año como miembro',
      icon: FaMedal,
      color: 'text-gold-500',
      earned: (() => {
        const joinDate = user.joinDate || user.createdAt;
        if (!joinDate) return false;
        try {
          const joinDateObj = new Date(joinDate);
          if (isNaN(joinDateObj.getTime())) return false;
          return (new Date().getTime() - joinDateObj.getTime()) > (365 * 24 * 60 * 60 * 1000);
        } catch (error) {
          return false;
        }
      })()
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

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.membershipDuration}
          </div>
          <p className="text-sm text-blue-700">Como miembro</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.renewalCount}
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
            {stats.benefitsUsed}
          </div>
          <p className="text-sm text-yellow-700">Beneficios</p>
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

      {/* Ranking simulado */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaUsers className="w-4 h-4 text-blue-500" />
          Tu Posición
        </h4>
        
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
          <div className="text-xl font-bold text-indigo-600 mb-1">
            #{Math.floor(Math.random() * 100) + 1}
          </div>
          <p className="text-sm text-indigo-700 mb-2">
            En el ranking general
          </p>
          <p className="text-xs text-indigo-600">
            ¡Sigue participando para subir posiciones!
          </p>
        </div>
      </div>

      {/* Progreso hacia siguiente nivel */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Progreso del Nivel</h4>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Nivel {user.membershipType === 'pro' || user.membershipType === 'pro-duo' ? 'Máximo' : 'Actual'}</span>
            <span>{Math.floor(Math.random() * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.floor(Math.random() * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {user.membershipType === 'pro' || user.membershipType === 'pro-duo' 
            ? '¡Has alcanzado el nivel máximo!' 
            : 'Participa en más eventos para subir de nivel'
          }
        </p>
      </div>
    </div>
  );
}