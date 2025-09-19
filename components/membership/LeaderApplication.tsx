'use client';

import React, { useState } from 'react';
import { FaTimes, FaUserTie, FaSpinner, FaUpload, FaCheck } from 'react-icons/fa';

interface LeaderApplicationProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmit?: () => void;
  userEligible?: boolean;
  eligibilityErrors?: string[];
}

export default function LeaderApplication({ 
  isOpen, 
  onClose, 
  onApplicationSubmit,
  userEligible = true,
  eligibilityErrors = []
}: LeaderApplicationProps) {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = useState({
    applicationText: '',
    attachments: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicationText.trim()) {
      newErrors.applicationText = 'La justificación es obligatoria';
    } else if (formData.applicationText.trim().length < 50) {
      newErrors.applicationText = 'La justificación debe tener al menos 50 caracteres';
    } else if (formData.applicationText.length > 2000) {
      newErrors.applicationText = 'La justificación no puede exceder 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setStep('submitting');

    try {
      const response = await fetch('/api/membership/apply-leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
        if (onApplicationSubmit) {
          setTimeout(() => {
            onApplicationSubmit();
          }, 2000);
        }
      } else {
        setErrors({ submit: data.message || 'Error al enviar la solicitud' });
        setStep('form');
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexión. Inténtalo de nuevo.' });
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ applicationText: '', attachments: [] });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaUserTie className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {step === 'form' && 'Aplicar para Leader'}
                  {step === 'submitting' && 'Enviando Aplicación'}
                  {step === 'success' && '¡Aplicación Enviada!'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <FaTimes className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Verificación de elegibilidad */}
            {!userEligible && eligibilityErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Requisitos No Cumplidos:
                </h4>
                <ul className="space-y-1">
                  {eligibilityErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contenido según el step */}
            {step === 'form' && (
              <div>
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Responsabilidades del Leader:
                  </h4>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>• Organizar y liderar eventos oficiales del club</li>
                      <li>• Mentorear y guiar a nuevos miembros</li>
                      <li>• Representar al club en eventos externos</li>
                      <li>• Tomar decisiones importantes sobre la dirección del club</li>
                      <li>• Mantener altos estándares de comportamiento y compromiso</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificación para Liderazgo *
                  </label>
                  <textarea
                    value={formData.applicationText}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationText: e.target.value }))}
                    placeholder="Explica por qué quieres ser Leader, tu experiencia relevante, y cómo planeas contribuir al club. Mínimo 50 caracteres, máximo 2000."
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                      errors.applicationText 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    disabled={!userEligible}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.applicationText && (
                      <p className="text-sm text-red-600">{errors.applicationText}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.applicationText.length}/2000
                    </p>
                  </div>
                </div>

                {/* Attachments placeholder */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documentos Adicionales (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Próximamente: Subir CV, certificaciones o documentos de apoyo
                    </p>
                  </div>
                </div>

                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Proceso de Revisión:
                  </h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>1. Tu aplicación será revisada por el comité actual</p>
                    <p>2. Entrevista con líderes existentes (si aplica)</p>
                    <p>3. Decisión final en 7-14 días hábiles</p>
                    <p>4. Notificación por email y en la plataforma</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'submitting' && (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" />
                <p className="text-gray-600">Enviando tu aplicación para Leader...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⭐</div>
                <h4 className="text-lg font-bold text-green-700 mb-2">
                  ¡Aplicación Enviada Exitosamente!
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Tu solicitud para Leader ha sido recibida y será revisada por el comité de liderazgo.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FaCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Tiempo estimado de respuesta: 7-14 días hábiles
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Recibirás una notificación por email con el resultado de tu aplicación.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 'form' && (
              <>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    userEligible 
                      ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleSubmit}
                  disabled={!userEligible}
                >
                  {userEligible ? 'Enviar Aplicación' : 'No Elegible'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </>
            )}

            {step === 'success' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
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