'use client';

import React, { useState } from 'react';
import { FaHeart, FaSpinner } from 'react-icons/fa';

interface VolunteerToggleProps {
  isVolunteer: boolean;
  onToggle?: (newState: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function VolunteerToggle({ 
  isVolunteer, 
  onToggle, 
  disabled = false,
  className = '' 
}: VolunteerToggleProps) {
  const [loading, setLoading] = useState(false);
  const [localState, setLocalState] = useState(isVolunteer);

  const handleToggle = async () => {
    if (disabled || loading) return;

    setLoading(true);
    const newState = !localState;

    try {
      const response = await fetch('/api/membership/volunteer-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enable: newState }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLocalState(newState);
        if (onToggle) {
          onToggle(newState);
        }
        
        // Mostrar toast de éxito (opcional)
        // TODO: Implementar sistema de toasts/notificaciones
      } else {
        console.error('Failed to update volunteer status:', data.message);
        // TODO: Mostrar error al usuario
      }
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${
            localState 
              ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <FaHeart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado de Voluntario
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {localState 
                ? 'Actualmente eres voluntario activo' 
                : 'No eres voluntario actualmente'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {loading && <FaSpinner className="animate-spin h-4 w-4 text-blue-500" />}
          
          <button
            onClick={handleToggle}
            disabled={disabled || loading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
              ${localState ? 'bg-cyan-600 dark:bg-cyan-700' : 'bg-gray-200 dark:bg-gray-700'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200
                ${localState ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Información sobre el rol de voluntario */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Beneficios del Voluntario:
        </h4>
        <div className="space-y-1">
          {[
            'Reconocimiento especial en eventos',
            'Acceso prioritario a capacitaciones',
            'Certificaciones de voluntariado',
            'Puntos adicionales por actividades'
          ].map((benefit, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                localState ? 'bg-cyan-500 dark:bg-cyan-400' : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Información especial para Leaders */}
      {localState && (
        <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            <strong>Nota:</strong> El rol de voluntario es requisito obligatorio para aplicar a Leader. 
            Mantén este estado activo si planeas solicitar liderazgo en el futuro.
          </p>
        </div>
      )}

      {/* Call to action */}
      {!localState && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Conviértete en voluntario para obtener beneficios adicionales y contribuir más activamente a la comunidad BSK.
          </p>
        </div>
      )}
    </div>
  );
}