'use client';

import React, { useState } from 'react';
import { getCSRFToken } from '@/lib/csrf-client';
import { FaTimes, FaCheckCircle, FaSpinner, FaFileContract, FaShieldAlt, FaHandshake, FaDatabase } from 'react-icons/fa';
import DocumentReader from './DocumentReader';
import { VOLUNTEER_TERMS, ETHICS_CODE, DATA_PROCESSING_AGREEMENT, VOLUNTEER_AGREEMENT } from './VolunteerDocuments';

interface VolunteerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    fullName: string;
    email: string;
    membershipNumber: string;
    phone: string;
  };
  onSuccess: () => void;
}

type DocumentType = 'terms' | 'ethics' | 'dataProcessing' | 'agreement' | null;

interface DocumentProgress {
  terms: boolean;
  ethics: boolean;
  dataProcessing: boolean;
  agreement: boolean;
}

export default function VolunteerApplicationModal({
  isOpen,
  onClose,
  userData,
  onSuccess
}: VolunteerApplicationModalProps) {
  const [currentDocument, setCurrentDocument] = useState<DocumentType>(null);
  const [documentsAccepted, setDocumentsAccepted] = useState<DocumentProgress>({
    terms: false,
    ethics: false,
    dataProcessing: false,
    agreement: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  console.log('VolunteerApplicationModal render:', { isOpen, currentDocument, documentsAccepted });

  const handleDocumentAccept = (docType: DocumentType) => {
    if (!docType) return;
    
    setDocumentsAccepted(prev => ({
      ...prev,
      [docType]: true
    }));
    setCurrentDocument(null);
  };

  const allDocumentsAccepted = Object.values(documentsAccepted).every(v => v);

  const handleSubmit = async () => {
    if (!allDocumentsAccepted) {
      setError('Debes aceptar todos los documentos para continuar');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/volunteer-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          acceptedTerms: documentsAccepted.terms,
          acceptedEthicsCode: documentsAccepted.ethics,
          acceptedDataProcessing: documentsAccepted.dataProcessing,
          acceptedVolunteerAgreement: documentsAccepted.agreement
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Error al enviar la solicitud');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const documents = [
    {
      id: 'terms' as DocumentType,
      title: 'Términos y Condiciones',
      description: 'Condiciones generales del programa de voluntariado',
      icon: FaFileContract,
      content: VOLUNTEER_TERMS,
      color: 'blue'
    },
    {
      id: 'ethics' as DocumentType,
      title: 'Código de Ética',
      description: 'Principios y conductas esperadas del voluntario',
      icon: FaShieldAlt,
      content: ETHICS_CODE,
      color: 'purple'
    },
    {
      id: 'dataProcessing' as DocumentType,
      title: 'Tratamiento de Datos',
      description: 'Autorización de uso de datos personales',
      icon: FaDatabase,
      content: DATA_PROCESSING_AGREEMENT,
      color: 'green'
    },
    {
      id: 'agreement' as DocumentType,
      title: 'Acuerdo de Voluntariado',
      description: 'Compromisos y beneficios del programa',
      icon: FaHandshake,
      content: VOLUNTEER_AGREEMENT,
      color: 'cyan'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      bg: string;
      text: string;
      border: string;
      button: string;
    }> = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        button: 'bg-green-600 hover:bg-green-700'
      },
      cyan: {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
        button: 'bg-cyan-600 hover:bg-cyan-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Modal principal con overlay */}
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal centrado */}
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            {/* Header */}
            <div className="bg-linear-to-r from-cyan-600 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Solicitud de Voluntariado
                  </h3>
                  <p className="text-cyan-100 text-sm mt-1">
                    BSK Motorcycle Team
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Cerrar modal de solicitud de voluntariado"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                  Información del Solicitante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Nombre:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {userData.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Email:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {userData.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Membresía:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {userData.membershipNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Teléfono:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {userData.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Documentos Requeridos
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Para completar tu solicitud de voluntariado, debes leer y aceptar los siguientes 
                  documentos. Es importante que leas cada uno completamente antes de aceptar.
                </p>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {documents.map((doc) => {
                  const colors = getColorClasses(doc.color);
                  const Icon = doc.icon;
                  const isAccepted = documentsAccepted[doc.id as keyof DocumentProgress];

                  return (
                    <div
                      key={doc.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isAccepted
                          ? `${colors.border} ${colors.bg}`
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isAccepted ? colors.bg : 'bg-gray-100 dark:bg-slate-800'}`}>
                          <Icon className={`text-xl ${isAccepted ? colors.text : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {doc.title}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                            {doc.description}
                          </p>
                          {isAccepted ? (
                            <div className="flex items-center space-x-2">
                              <FaCheckCircle className="text-green-600 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Aceptado
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCurrentDocument(doc.id)}
                              className={`w-full px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors ${colors.button}`}
                            >
                              Leer y Aceptar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Progreso
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {Object.values(documentsAccepted).filter(v => v).length} de 4 documentos
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bg-linear-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    ref={(el) => {
                      if (el) {
                        el.style.width = `${Math.min(100, Math.max(0, (Object.values(documentsAccepted).filter(v => v).length / 4) * 100))}%`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allDocumentsAccepted || submitting}
                className={`px-8 py-2 rounded-lg font-medium transition-all ${
                  allDocumentsAccepted && !submitting
                    ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-md'
                    : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin" />
                    <span>Enviando...</span>
                  </span>
                ) : (
                  'Enviar Solicitud'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Reader Modal */}
      {currentDocument && (
        <DocumentReader
          title={documents.find(d => d.id === currentDocument)?.title || ''}
          content={documents.find(d => d.id === currentDocument)?.content || <div />}
          onAccept={() => handleDocumentAccept(currentDocument)}
          onCancel={() => setCurrentDocument(null)}
          acceptButtonText="Acepto los términos"
        />
      )}
    </>
  );
}
