'use client';

import React, { useState } from 'react';
import { getCSRFToken } from '@/lib/csrf-client';
import { Membership, RequestUpgradeResponse } from '@/types/membership';
import { MEMBERSHIP_CONFIG, getNextMembershipType } from '@/data/membershipConfig';
import { FaTimes, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

interface UpgradeFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMembership: Membership;
  onUpgradeSuccess?: () => void;
}

export default function UpgradeFlowModal({ 
  isOpen, 
  onClose, 
  currentMembership,
  onUpgradeSuccess 
}: UpgradeFlowModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'result'>('confirm');
  const [result, setResult] = useState<RequestUpgradeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextType = getNextMembershipType(currentMembership.type);
  const nextConfig = nextType ? MEMBERSHIP_CONFIG[nextType] : null;

  if (!isOpen || !nextType || !nextConfig) return null;

  const handleUpgradeRequest = async () => {
    setStep('processing');
    setError(null);

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/request-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          from: currentMembership.type,
          to: nextType
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ 
          allowed: true, 
          missingRequirements: [],
          ...data.data 
        });
        setStep('result');
        
        // Llamar callback si el ascenso fue exitoso
        if (data.data?.newMembershipType && onUpgradeSuccess) {
          setTimeout(() => {
            onUpgradeSuccess();
          }, 2000);
        }
      } else {
        if (data.data && !data.data.allowed) {
          setResult(data.data);
          setStep('result');
        } else {
          setError(data.message || 'Error al procesar la solicitud');
          setStep('confirm');
        }
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setStep('confirm');
    }
  };

  const resetModal = () => {
    setStep('confirm');
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {step === 'confirm' && 'Solicitar Ascenso'}
                {step === 'processing' && 'Procesando Solicitud'}
                {step === 'result' && (result?.allowed ? '¡Ascenso Exitoso!' : 'Requisitos Pendientes')}
              </h3>
              <button
                onClick={handleClose}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-full"
                aria-label="Cerrar modal"
              >
                <FaTimes className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Contenido según el step */}
            {step === 'confirm' && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-3xl">{MEMBERSHIP_CONFIG[currentMembership.type].badge}</div>
                    <FaCheck className="h-6 w-6 text-gray-400" />
                    <div className="text-3xl">{nextConfig.badge}</div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{MEMBERSHIP_CONFIG[currentMembership.type].name}</span>
                      {' → '}
                      <span 
                        className="font-medium"
                        ref={(el) => {
                          if (el) {
                            el.style.color = nextConfig.color;
                          }
                        }}
                      >
                        {nextConfig.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Estado de Requisitos:
                  </h4>
                  <div className="space-y-2">
                    {currentMembership.progress.requirements.map((req) => (
                      <div key={req.id} className="flex items-center space-x-2">
                        {req.fulfilled ? (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ${req.fulfilled ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                          {req.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round(req.progress)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
                  </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Al solicitar este ascenso, verificaremos automáticamente que cumples con todos los requisitos. 
                  {nextType === 'Leader' && ' Para el rol de Leader, tu solicitud será enviada para revisión manual.'}
                </p>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Verificando requisitos y procesando solicitud...</p>
              </div>
            )}

            {step === 'result' && result && (
              <div>
                {result.allowed ? (
                  <div className="text-center py-4">
                    <div className="text-6xl mb-4">{nextConfig.badge}</div>
                    <h4 className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                      ¡Bienvenido a {nextConfig.name}!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Tu ascenso ha sido procesado exitosamente. Ahora tienes acceso a todos los beneficios de {nextConfig.name}.
                    </p>
                    {(result as { estimatedReviewTime?: string }).estimatedReviewTime && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Tu solicitud está en revisión. Tiempo estimado: {(result as { estimatedReviewTime?: string }).estimatedReviewTime}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Requisitos Pendientes
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Aún no cumples con todos los requisitos para ascender a {nextConfig.name}:
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {result.missingRequirements.map((req, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <FaExclamationTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-300 mt-0.5" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">{req.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Continúa participando en eventos y actividades para cumplir estos requisitos. 
                        Tu progreso se actualiza automáticamente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 'confirm' && (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleUpgradeRequest}
                >
                  Solicitar Ascenso
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </>
            )}

            {step === 'result' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleClose}
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}