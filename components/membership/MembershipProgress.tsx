'use client';

import React from 'react';
import { MembershipProgress as MembershipProgressType } from '@/types/membership';
import { MEMBERSHIP_CONFIG } from '@/data/membershipConfig';
import { FaCheck, FaClock, FaLock } from 'react-icons/fa';

interface MembershipProgressProps {
  progress: MembershipProgressType;
  className?: string;
}

export default function MembershipProgress({ progress, className = '' }: MembershipProgressProps) {
  const nextConfig = progress.nextType ? MEMBERSHIP_CONFIG[progress.nextType] : null;

  if (!progress.nextType) {
    return (
      <div className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl ${className}`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-lg font-bold mb-1">¡Nivel Máximo Alcanzado!</h3>
          <p className="text-yellow-100 text-sm">
            Has alcanzado el nivel más alto disponible. Continúa participando para mantener tu estatus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Progreso a {nextConfig?.name}
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {progress.percent}%
          </span>
        </div>
        
        {/* Barra de progreso principal */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${nextConfig?.gradient} transition-all duration-700 ease-out`}
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600">
          {nextConfig?.description}
        </p>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Requisitos</h4>
        
        {progress.requirements.map((requirement) => (
          <div key={requirement.id} className="flex items-start space-x-3">
            {/* Icono de estado */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              requirement.fulfilled 
                ? 'bg-green-100 text-green-600' 
                : requirement.progress > 0 
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {requirement.fulfilled ? (
                <FaCheck className="h-3 w-3" />
              ) : requirement.progress > 0 ? (
                <FaClock className="h-3 w-3" />
              ) : (
                <FaLock className="h-3 w-3" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-medium ${
                  requirement.fulfilled ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {requirement.label}
                </p>
                <span className={`text-xs ${
                  requirement.fulfilled ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {Math.round(requirement.progress)}%
                </span>
              </div>

              {/* Barra de progreso individual */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    requirement.fulfilled 
                      ? 'bg-green-500' 
                      : requirement.progress > 0 
                        ? 'bg-yellow-500'
                        : 'bg-gray-300'
                  }`}
                  style={{ width: `${requirement.progress}%` }}
                ></div>
              </div>

              {requirement.detail && (
                <p className="text-xs text-gray-500 mt-1">
                  {requirement.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de progreso */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {progress.requirements.filter(r => r.fulfilled).length} de {progress.requirements.length} completados
          </span>
          {progress.percent === 100 && (
            <span className="text-green-600 font-medium">
              ¡Listo para ascender!
            </span>
          )}
        </div>
      </div>

      {/* CTA si está listo para ascender */}
      {progress.percent === 100 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <FaCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Cumples todos los requisitos para {nextConfig?.name}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Puedes solicitar tu ascenso ahora usando el botón "Solicitar Ascenso" en las acciones de membresía.
          </p>
        </div>
      )}
    </div>
  );
}