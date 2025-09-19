'use client';

import React from 'react';
import { Achievement } from '@/types/membership';
import { 
  FaCalendarCheck, 
  FaStar, 
  FaHeart, 
  FaTrophy, 
  FaMedal, 
  FaGem,
  FaCrown
} from 'react-icons/fa';

interface AchievementsListProps {
  achievements: Achievement[];
  className?: string;
}

const iconMap = {
  FaCalendarCheck,
  FaStar,
  FaHeart,
  FaTrophy,
  FaMedal,
  FaGem,
  FaCrown
};

export default function AchievementsList({ achievements, className = '' }: AchievementsListProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      events: 'bg-blue-100 text-blue-800',
      volunteering: 'bg-cyan-100 text-cyan-800',
      points: 'bg-yellow-100 text-yellow-800',
      social: 'bg-green-100 text-green-800',
      leadership: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  if (achievements.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros y Retos</h3>
        <div className="text-center py-8">
          <FaTrophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aún no tienes logros desbloqueados</p>
          <p className="text-sm text-gray-400 mt-1">
            Participa en eventos y actividades para obtener tus primeros logros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Logros y Retos</h3>
        <span className="text-sm text-gray-500">
          {achievements.length} logro{achievements.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || FaTrophy;
          
          return (
            <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <IconComponent className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                      {achievement.category}
                    </span>
                    <span className="text-sm font-medium text-yellow-600">
                      +{achievement.points}
                    </span>
                  </div>
                </div>
                
                {achievement.earnedAt && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <FaCalendarCheck className="h-3 w-3 mr-1" />
                    Obtenido el {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                )}
                
                {achievement.requirements && achievement.requirements.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Requisitos:</p>
                    <ul className="text-xs text-gray-600">
                      {achievement.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logros próximos o sugeridos */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Próximos Logros</h4>
        <div className="space-y-2">
          {/* Logros sugeridos basados en progreso actual */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <FaStar className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">Participante Activo</span>
            </div>
            <span className="text-xs text-blue-600">Asiste a 10 eventos</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex items-center space-x-2">
              <FaHeart className="h-4 w-4 text-cyan-600" />
              <span className="text-sm text-cyan-800">Corazón Solidario</span>
            </div>
            <span className="text-xs text-cyan-600">Completa 5 voluntariados</span>
          </div>
        </div>
      </div>
    </div>
  );
}