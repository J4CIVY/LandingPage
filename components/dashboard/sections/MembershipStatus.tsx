'use client';

import { useState, useEffect } from 'react';
import { IUser } from '@/lib/models/User';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaEye, 
  FaStar,
  FaAward,
  FaCrown,
  FaHeart,
  FaHandsHelping,
  FaUserTie,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa';

interface MembershipStatusProps {
  user: IUser;
  stats: {
    daysSinceJoining: number;
    memberSince: string;
    isActive: boolean;
  };
}

interface MembershipInfo {
  current: string;
  displayName: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  isVolunteer: boolean;
  isLeader: boolean;
  nextUpgrade?: string;
  canUpgrade: boolean;
}

interface UserPoints {
  totalPoints: number;
  monthlyPoints: number;
  level: number;
  nextLevelPoints: number;
}

const membershipConfig: Record<string, any> = {
  'friend': {
    displayName: 'Friend',
    icon: FaHeart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    description: 'Miembro de la comunidad BSK',
    nextUpgrade: 'rider'
  },
  'rider': {
    displayName: 'Rider',
    icon: FaStar,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    description: 'Motociclista activo del equipo',
    nextUpgrade: 'pro'
  },
  'pro': {
    displayName: 'Pro',
    icon: FaAward,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    description: 'Miembro profesional experimentado',
    nextUpgrade: 'legend'
  },
  'legend': {
    displayName: 'Legend',
    icon: FaCrown,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    description: 'Leyenda del motociclismo BSK',
    nextUpgrade: 'master'
  },
  'master': {
    displayName: 'Master',
    icon: FaCrown,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    description: 'Maestro del equipo BSK',
    nextUpgrade: null
  },
  'volunteer': {
    displayName: 'Volunteer',
    icon: FaHandsHelping,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    description: 'Voluntario activo del equipo',
    isComplementary: true
  },
  'leader': {
    displayName: 'Leader',
    icon: FaUserTie,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    description: 'Líder organizacional',
    isComplementary: true
  },
  'admin': {
    displayName: 'Administrador',
    icon: FaUserTie,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    description: 'Administrador del sistema'
  },
  'super-admin': {
    displayName: 'Super Administrador',
    icon: FaUserTie,
    color: 'text-gray-800 dark:text-gray-200',
    bgColor: 'bg-gray-100 dark:bg-gray-800/20 border-gray-300 dark:border-gray-700',
    description: 'Super administrador del sistema'
  }
};

export default function MembershipStatus({ user, stats }: MembershipStatusProps) {
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMembershipData();
    }
  }, [user]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      
      // Obtener información de puntos
      const pointsResponse = await fetch('/api/users/points');
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setUserPoints(pointsData.data);
      }

      // Obtener estado de membresía completo
      const membershipResponse = await fetch('/api/membership/status');
      if (membershipResponse.ok) {
        const membershipData = await membershipResponse.json();
        
        // Procesar información de membresía
        const config = membershipConfig[user.membershipType] || membershipConfig['friend'];
        
        setMembershipInfo({
          current: user.membershipType,
          displayName: config.displayName,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
          isVolunteer: (user as any).isVolunteer || false,
          isLeader: (user as any).membershipType === 'leader' || (user as any).isLeader || false,
          nextUpgrade: config.nextUpgrade,
          canUpgrade: membershipData.data?.canUpgrade || false
        });
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
        </div>
      </div>
    );
  }

  const config = membershipInfo || {
    current: user.membershipType,
    displayName: membershipConfig[user.membershipType]?.displayName || 'Friend',
    icon: membershipConfig[user.membershipType]?.icon || FaHeart,
    color: membershipConfig[user.membershipType]?.color || 'text-pink-600',
    bgColor: membershipConfig[user.membershipType]?.bgColor || 'bg-pink-50',
    isVolunteer: (user as any).isVolunteer || false,
    isLeader: (user as any).membershipType === 'leader' || (user as any).isLeader || false,
    nextUpgrade: membershipConfig[user.membershipType]?.nextUpgrade,
    canUpgrade: false
  };

  const MembershipIcon = config.icon;
  // Calcular estado de membresía (por ahora simple basado en isActive)
  const getStatusColor = () => {
    if (stats.isActive) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = () => {
    if (stats.isActive) return 'Activa';
    return 'Inactiva';
  };

  const getStatusBgColor = () => {
    if (stats.isActive) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
          Estado de la Membresía
        </h3>
      </div>

      <div className="space-y-4">
        {/* Membresía Principal */}
        <div className={`p-4 rounded-lg border ${config.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MembershipIcon className={`text-2xl mr-3 ${config.color}`} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                  {config.displayName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {membershipConfig[config.current]?.description || 'Membresía principal'}
                </p>
              </div>
            </div>
            {config.nextUpgrade && config.canUpgrade && (
              <button 
                onClick={() => window.location.href = `/dashboard/membership`}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
              >
                Actualizar <FaChevronRight className="ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Membresías Complementarias */}
        {(config.isVolunteer || config.isLeader) && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Membresías Complementarias
            </h5>
            <div className="flex flex-wrap gap-2">
              {config.isVolunteer && (
                <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs">
                  <FaHandsHelping className="mr-1" />
                  Volunteer
                </div>
              )}
              {config.isLeader && (
                <div className="flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-xs">
                  <FaUserTie className="mr-1" />
                  Leader
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de Puntos */}
        {userPoints && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Puntos Totales
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {userPoints.totalPoints.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
              <span>Este mes: {userPoints.monthlyPoints}</span>
              <span>Nivel: {userPoints.level}</span>
            </div>
          </div>
        )}

        {/* Información Temporal */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-slate-400">Días como miembro</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">{stats.daysSinceJoining}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-slate-400">Miembro desde</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">{stats.memberSince}</span>
          </div>
        </div>

        {/* Estado */}
        <div className={`p-3 rounded-lg border ${getStatusBgColor()}`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-slate-400">Estado:</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/dashboard/membership'}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <FaEye className="mr-2" />
            Gestionar Membresía
          </button>
          
          {/* Botones específicos para Leaders */}
          {config.isLeader && (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => window.location.href = '/dashboard/leadership'}
                className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <FaUserTie className="mr-1" />
                Dashboard Leader
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/voting'}
                className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <FaAward className="mr-1" />
                Votaciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}