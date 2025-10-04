'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaSpinner, FaUserPlus, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import VolunteerApplicationModal from './VolunteerApplicationModal';

interface VolunteerToggleProps {
  isVolunteer: boolean;
  userData: {
    fullName: string;
    email: string;
    membershipNumber: string;
    phone: string;
  };
  onToggle?: (newState: boolean) => void;
  disabled?: boolean;
  className?: string;
}

interface ApplicationStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewNotes?: string;
}

export default function VolunteerToggle({ 
  isVolunteer, 
  userData,
  onToggle, 
  disabled = false,
  className = '' 
}: VolunteerToggleProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({ status: 'none' });

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const response = await fetch('/api/membership/volunteer-application/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplicationStatus(data.data || { status: 'none' });
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    }
  };

  const handleApplicationSuccess = () => {
    fetchApplicationStatus();
    if (onToggle) {
      onToggle(true);
    }
  };

  console.log('VolunteerToggle render:', { showModal, isVolunteer, applicationStatus });

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              isVolunteer 
                ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300' 
                : applicationStatus.status === 'pending'
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              <FaHeart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Estado de Voluntario
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isVolunteer 
                  ? 'Eres voluntario activo' 
                  : applicationStatus.status === 'pending'
                  ? 'Solicitud en revisión'
                  : applicationStatus.status === 'rejected'
                  ? 'Solicitud rechazada'
                  : 'No eres voluntario'
                }
              </p>
            </div>
          </div>

          {/* Status Icon */}
          <div>
            {isVolunteer ? (
              <FaCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
            ) : applicationStatus.status === 'pending' ? (
              <FaClock className="text-3xl text-yellow-600 dark:text-yellow-400" />
            ) : applicationStatus.status === 'rejected' ? (
              <FaTimesCircle className="text-3xl text-red-600 dark:text-red-400" />
            ) : null}
          </div>
        </div>

        {/* Status Details */}
        {applicationStatus.status === 'pending' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Solicitud enviada:</strong> {new Date(applicationStatus.submittedAt!).toLocaleDateString('es-ES')}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Tu solicitud está siendo revisada por la directiva del club. Te notificaremos por email cuando sea aprobada.
            </p>
          </div>
        )}

        {applicationStatus.status === 'rejected' && applicationStatus.reviewNotes && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Motivo de rechazo:
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {applicationStatus.reviewNotes}
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isVolunteer && applicationStatus.status !== 'pending' && (
          <button
            onClick={() => setShowModal(true)}
            disabled={disabled || loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Solicitar Ser Voluntario</span>
              </>
            )}
          </button>
        )}

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
                  isVolunteer ? 'bg-cyan-500 dark:bg-cyan-400' : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Información especial para voluntarios activos */}
        {isVolunteer && (
          <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              <strong>Nota:</strong> El rol de voluntario es requisito obligatorio para aplicar a Leader. 
              Mantén este estado activo si planeas solicitar liderazgo en el futuro.
            </p>
          </div>
        )}

        {/* Call to action para no voluntarios */}
        {!isVolunteer && applicationStatus.status === 'none' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Conviértete en voluntario para obtener beneficios adicionales y contribuir más activamente a la comunidad BSK.
            </p>
          </div>
        )}
      </div>

      {/* Modal de solicitud */}
      <VolunteerApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userData={userData}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
}