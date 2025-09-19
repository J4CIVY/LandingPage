'use client';

import React from 'react';
import { RequirementStatus } from '@/types/membership';
import { FaCheck, FaClock, FaLock, FaExternalLinkAlt } from 'react-icons/fa';

interface RequirementItemProps {
  requirement: RequirementStatus;
  onActionClick?: (requirementId: string) => void;
  className?: string;
}

export default function RequirementItem({ 
  requirement, 
  onActionClick,
  className = '' 
}: RequirementItemProps) {
  const getStatusInfo = () => {
    if (requirement.fulfilled) {
      return {
        icon: FaCheck,
        iconClass: 'text-green-600 bg-green-100',
        textClass: 'text-green-700',
        bgClass: 'bg-green-50 border-green-200',
        statusText: 'Completado'
      };
    } else if (requirement.progress > 0) {
      return {
        icon: FaClock,
        iconClass: 'text-yellow-600 bg-yellow-100',
        textClass: 'text-yellow-700',
        bgClass: 'bg-yellow-50 border-yellow-200',
        statusText: 'En progreso'
      };
    } else {
      return {
        icon: FaLock,
        iconClass: 'text-gray-400 bg-gray-100',
        textClass: 'text-gray-600',
        bgClass: 'bg-gray-50 border-gray-200',
        statusText: 'Pendiente'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  const getActionText = (requirementId: string) => {
    const actions: Record<string, string> = {
      'events': 'Ver Eventos Disponibles',
      'points': 'Ver Cómo Ganar Puntos',
      'volunteering': 'Ver Oportunidades de Voluntariado',
      'time': 'Ver Mi Progreso',
    };
    return actions[requirementId] || 'Ver Más Info';
  };

  const shouldShowAction = !requirement.fulfilled && onActionClick;

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${statusInfo.bgClass} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Icono de estado */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${statusInfo.iconClass}`}>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`text-sm font-medium ${statusInfo.textClass}`}>
                {requirement.label}
              </h4>
              {requirement.detail && (
                <p className="text-sm text-gray-600 mt-1">
                  {requirement.detail}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.iconClass}`}>
                {statusInfo.statusText}
              </span>
              <span className={`text-sm font-medium ${statusInfo.textClass}`}>
                {Math.round(requirement.progress)}%
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  requirement.fulfilled 
                    ? 'bg-green-500' 
                    : requirement.progress > 0 
                      ? 'bg-yellow-500'
                      : 'bg-gray-300'
                }`}
                style={{ width: `${requirement.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Acción disponible */}
          {shouldShowAction && (
            <div className="mt-3">
              <button
                onClick={() => onActionClick(requirement.id)}
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <span>{getActionText(requirement.id)}</span>
                <FaExternalLinkAlt className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Información adicional para eventos relacionados */}
          {requirement.relatedEventId && (
            <div className="mt-2 p-2 bg-white/50 rounded border border-gray-300">
              <p className="text-xs text-gray-600">
                Relacionado con evento: {requirement.relatedEventId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información de ayuda para requisitos bloqueados */}
      {!requirement.fulfilled && requirement.progress === 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <div className="flex items-start space-x-2">
            <FaLock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-xs text-gray-600">
              {(() => {
                switch (requirement.id) {
                  case 'events':
                    return 'Participa en eventos del club para desbloquear este requisito. Revisa el calendario de eventos en la sección correspondiente.';
                  case 'points':
                    return 'Gana puntos participando en eventos, voluntariados y actividades comunitarias.';
                  case 'volunteering':
                    return 'Únete a actividades de voluntariado para ayudar a la comunidad y ganar experiencia.';
                  case 'time':
                    return 'Este requisito se cumple automáticamente con el tiempo. Mantén tu membresía activa.';
                  default:
                    return 'Consulta los requisitos específicos para este tipo de membresía.';
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}