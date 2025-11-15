'use client';

import React from 'react';
import { Membership } from '@/types/membership';
import { MEMBERSHIP_CONFIG } from '@/data/membershipConfig';
import { 
  FaUserFriends, 
  FaMotorcycle, 
  FaMedal, 
  FaCrown, 
  FaGem, 
  FaHeart, 
  FaUserTie,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

interface MembershipCardProps {
  membership: Membership;
  className?: string;
  showProgress?: boolean;
}

const iconMap = {
  FaUserFriends,
  FaMotorcycle,
  FaMedal,
  FaCrown,
  FaGem,
  FaHeart,
  FaUserTie,
  FaCalendarAlt,
  FaClock
};

export default function MembershipCard({ 
  membership, 
  className = '',
  showProgress = true 
}: MembershipCardProps) {
  const config = MEMBERSHIP_CONFIG[membership.type];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || FaUserFriends;
  
  // Calcular días restantes si hay fecha de expiración
  const daysRemaining = membership.expiryDate 
    ? Math.max(0, Math.ceil((new Date(membership.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Determinar estado visual basado en días restantes
  const getStatusColor = () => {
    if (membership.status === 'expired') return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
    if (membership.status === 'cancelled') return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60';
    if (daysRemaining !== null && daysRemaining <= 30) return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/30';
    return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
  };

  const getStatusText = () => {
    switch (membership.status) {
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      case 'pending':
        return 'Pendiente';
      case 'active':
        if (daysRemaining !== null && daysRemaining <= 30) {
          return `Expira en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`;
        }
        return 'Activa';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl border-2 hover:shadow-lg
      ${getStatusColor()} ${className}
    `}>
      {/* Header con gradiente */}
      <div 
        className={`p-6 bg-linear-to-r ${config.gradient} text-white relative dark:text-white`}
        ref={(el) => {
          if (el) {
            el.style.backgroundColor = config.color;
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-white dark:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white dark:text-white">{config.name}</h3>
              <p className="text-white/90 dark:text-white/80 text-sm">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{config.badge}</div>
            <div className="text-sm text-white/80 dark:text-white/70 mt-1">
              {membership.points.toLocaleString()} pts
            </div>
          </div>
        </div>

        {/* Estado y fecha */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="h-4 w-4 text-white dark:text-white/80" />
            <span className="text-white dark:text-white/80">Desde {new Date(membership.startDate).toLocaleDateString()}</span>
          </div>
          <div className="px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs font-medium text-white dark:text-white/80">
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
  <div className="p-6 bg-white dark:bg-gray-800">
        {/* Roles adicionales */}
        <div className="flex flex-wrap gap-2 mb-4">
          {membership.volunteer && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
              <FaHeart className="h-3 w-3 mr-1" />
              Volunteer
            </span>
          )}
          {membership.type === 'Leader' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <FaUserTie className="h-3 w-3 mr-1" />
              Leader
            </span>
          )}
        </div>

        {/* Beneficios clave */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Beneficios Activos</h4>
          <div className="space-y-1">
            {membership.benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-2"></div>
                {benefit}
              </div>
            ))}
            {membership.benefits.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                +{membership.benefits.length - 3} beneficios más
              </div>
            )}
          </div>
        </div>

        {/* Progreso hacia siguiente nivel */}
        {showProgress && membership.progress.nextType && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Progreso a {membership.progress.nextType}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {membership.progress.percent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
              <div 
                className={`absolute left-0 top-0 h-2 rounded-full bg-linear-to-r ${config.gradient}`}
                ref={(el) => {
                  if (el) {
                    el.style.width = `${Math.min(100, Math.max(0, membership.progress.percent))}%`;
                  }
                }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {membership.progress.requirements.filter(r => !r.fulfilled).length} requisitos pendientes
            </div>
          </div>
        )}
      </div>

      {/* Aplicación de Leader pendiente */}
      {membership.leaderApplication?.status === 'pending' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Aplicación a Leader en revisión
            </span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-1">
            Tiempo estimado de respuesta: 7-14 días hábiles
          </p>
        </div>
      )}
    </div>
  );
}