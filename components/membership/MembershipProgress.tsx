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
      <div className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl dark:bg-gradient-to-r dark:from-yellow-700 dark:to-yellow-900 ${className}`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-lg font-bold mb-1">¡Nivel Máximo Alcanzado!</h3>
          <p className="text-yellow-100 dark:text-yellow-200 text-sm">
            Has alcanzado el nivel más alto disponible. Continúa participando para mantener tu estatus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progreso a {nextConfig?.name}
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {progress.percent}%
          </span>
        </div>
        {/* Barra de progreso principal */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${nextConfig?.gradient}`}
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {nextConfig?.description}
        </p>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Requisitos</h4>
        {progress.requirements.map((requirement) => (
          <div key={requirement.id} className="flex items-start space-x-3">
            {/* Icono de estado */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              requirement.fulfilled 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' 
                : requirement.progress > 0 
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
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
                  requirement.fulfilled ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {requirement.label}
                </p>
                <span className={`text-xs ${
                  requirement.fulfilled ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {Math.round(requirement.progress)}%
                </span>
              </div>

              {/* Barra de progreso individual */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    requirement.fulfilled 
                      ? 'bg-green-500 dark:bg-green-400' 
                      : requirement.progress > 0 
                        ? 'bg-yellow-500 dark:bg-yellow-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ width: `${requirement.progress}%` }}
                ></div>
              </div>

              {requirement.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {requirement.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de progreso */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {progress.requirements.filter(r => r.fulfilled).length} de {progress.requirements.length} completados
          </span>
          {progress.percent === 100 && (
            <span className="text-green-600 dark:text-green-300 font-medium">
              ¡Listo para ascender!
            </span>
          )}
        </div>
      </div>

      {/* CTA si está listo para ascender */}
      {progress.percent === 100 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <FaCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Cumples todos los requisitos para {nextConfig?.name}
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-200 mt-1">
            Puedes solicitar tu ascenso ahora usando el botón "Solicitar Ascenso" en las acciones de membresía.
          </p>
        </div>
      )}
    </div>
  );
}