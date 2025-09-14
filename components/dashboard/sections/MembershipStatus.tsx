'use client';

import { IUser } from '@/lib/models/User';
import { FaUser, FaCalendarAlt, FaEye } from 'react-icons/fa';

interface MembershipStatusProps {
  user: IUser;
  stats: {
    daysSinceJoining: number;
    memberSince: string;
    isActive: boolean;
  };
}

const membershipTypeNames: Record<string, string> = {
  'friend': 'Amigo',
  'rider': 'Piloto',
  'rider-duo': 'Piloto Dúo',
  'pro': 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

export default function MembershipStatus({ user, stats }: MembershipStatusProps) {
  if (!user) {
    return null;
  }

  const membershipTypeName = user?.membershipType ? 
    (membershipTypeNames[user.membershipType] || user.membershipType) : 
    'Sin membresía';
  
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
        {/* Tipo de Membresía */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-slate-400">Tipo:</span>
          <span className="font-medium text-gray-900 dark:text-slate-100">{membershipTypeName}</span>
        </div>

        {/* Días como miembro */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-slate-400">Días como miembro:</span>
          <span className="font-medium text-gray-900 dark:text-slate-100">{stats.daysSinceJoining}</span>
        </div>

        {/* Miembro desde */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-slate-400">Miembro desde:</span>
          <span className="font-medium text-gray-900 dark:text-slate-100">{stats.memberSince}</span>
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

        {/* Botón Ver más */}
        <div className="pt-2">
          <button 
            onClick={() => window.location.href = '/membership-status'}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <FaEye className="mr-2" />
            Ver estado completo
          </button>
        </div>
      </div>
    </div>
  );
}