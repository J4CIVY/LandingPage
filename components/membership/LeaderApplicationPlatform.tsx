'use client';

import React, { useState, useEffect } from 'react';
import { getCSRFToken } from '@/lib/csrf-client';
import { 
  FaFileUpload, 
  FaUsers, 
  FaClipboardCheck, 
  FaSave, 
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlus
} from 'react-icons/fa';

interface EndorsementRequest {
  id: string;
  userType: 'leader' | 'master';
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requestedAt: string;
}

interface LeadershipPlan {
  vision: string;
  priorities: string[];
  project12Months: string;
  metrics: string[];
  operationalCommitment: string;
  availabilityConfirmation: boolean;
}

interface ApplicationFormData {
  leadershipPlan: LeadershipPlan;
  personalStatement: string;
  experience: string;
  endorsements: EndorsementRequest[];
  documents: File[];
}

interface LeaderApplicationPlatformProps {
  className?: string;
}

const LeaderApplicationPlatform: React.FC<LeaderApplicationPlatformProps> = ({ 
  className = '' 
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    leadershipPlan: {
      vision: '',
      priorities: [''],
      project12Months: '',
      metrics: [''],
      operationalCommitment: '',
      availabilityConfirmation: false
    },
    personalStatement: '',
    experience: '',
    endorsements: [],
    documents: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableEndorsers, setAvailableEndorsers] = useState<Array<{
    id: string;
    name: string;
    membershipType: string;
    [key: string]: unknown;
  }>>([]);

  const steps = [
    { id: 1, title: 'Plan de Liderazgo', icon: FaClipboardCheck },
    { id: 2, title: 'Información Personal', icon: FaEdit },
    { id: 3, title: 'Avales y Endorsements', icon: FaUsers },
    { id: 4, title: 'Documentos', icon: FaFileUpload },
    { id: 5, title: 'Revisión y Envío', icon: FaPaperPlane }
  ];

  useEffect(() => {
    fetchAvailableEndorsers();
  }, []);

  const fetchAvailableEndorsers = async () => {
    try {
      const response = await fetch('/api/membership/available-endorsers');
      if (response.ok) {
        const result = await response.json();
        setAvailableEndorsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching endorsers:', error);
    }
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...formData.leadershipPlan.priorities];
    newPriorities[index] = value;
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        priorities: newPriorities
      }
    });
  };

  const addPriority = () => {
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        priorities: [...formData.leadershipPlan.priorities, '']
      }
    });
  };

  const removePriority = (index: number) => {
    const newPriorities = formData.leadershipPlan.priorities.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        priorities: newPriorities
      }
    });
  };

  const handleMetricChange = (index: number, value: string) => {
    const newMetrics = [...formData.leadershipPlan.metrics];
    newMetrics[index] = value;
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        metrics: newMetrics
      }
    });
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        metrics: [...formData.leadershipPlan.metrics, '']
      }
    });
  };

  const removeMetric = (index: number) => {
    const newMetrics = formData.leadershipPlan.metrics.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      leadershipPlan: {
        ...formData.leadershipPlan,
        metrics: newMetrics
      }
    });
  };

  const requestEndorsement = async (endorserId: string, userType: 'leader' | 'master') => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/request-endorsement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({
          endorserId,
          userType,
          applicationData: formData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Solicitud de aval enviada exitosamente');
        
        // Actualizar estado de endorsements
        const newEndorsement: EndorsementRequest = {
          id: result.data.id,
          userType,
          userId: endorserId,
          userName: result.data.userName,
          status: 'pending',
          requestedAt: new Date().toISOString()
        };

        setFormData({
          ...formData,
          endorsements: [...formData.endorsements, newEndorsement]
        });
      } else {
        setError('Error al solicitar aval');
      }
    } catch {
      setError('Error al solicitar aval');
    }
  };

  const saveAsDraft = async () => {
    try {
      setSaving(true);
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/leader-application/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Borrador guardado exitosamente');
      } else {
        setError('Error al guardar borrador');
      }
    } catch {
      setError('Error al guardar borrador');
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    try {
      setLoading(true);
      
      // Validar que tengamos los avales mínimos
      const leaderEndorsements = formData.endorsements.filter(e => e.userType === 'leader' && e.status === 'approved');
      const masterEndorsements = formData.endorsements.filter(e => e.userType === 'master' && e.status === 'approved');
      
      if (leaderEndorsements.length < 3) {
        setError('Se requieren mínimo 3 avales de Leaders activos');
        setLoading(false);
        return;
      }
      
      if (masterEndorsements.length < 5) {
        setError('Se requieren mínimo 5 avales de Masters activos');
        setLoading(false);
        return;
      }

      const csrfToken = getCSRFToken();
      const response = await fetch('/api/membership/leader-application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Postulación enviada exitosamente. Será revisada por la Comisión Evaluadora.');
        setCurrentStep(1); // Resetear formulario
      } else {
        const result = await response.json();
        setError(result.message || 'Error al enviar postulación');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar postulación');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Plan de Liderazgo
            </h3>
            
            {/* Visión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visión para BSKMT (12 meses)
              </label>
              <textarea
                value={formData.leadershipPlan.vision}
                onChange={(e) => setFormData({
                  ...formData,
                  leadershipPlan: {
                    ...formData.leadershipPlan,
                    vision: e.target.value
                  }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe tu visión para el club en los próximos 12 meses..."
              />
            </div>

            {/* Prioridades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridades Estratégicas
              </label>
              {formData.leadershipPlan.priorities.map((priority, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={priority}
                    onChange={(e) => handlePriorityChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Prioridad ${index + 1}`}
                  />
                  {formData.leadershipPlan.priorities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriority(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPriority}
                className="flex items-center text-purple-600 hover:text-purple-800 text-sm"
              >
                <FaPlus className="mr-1" /> Agregar Prioridad
              </button>
            </div>

            {/* Proyecto 12 Meses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proyecto Principal (12 meses)
              </label>
              <textarea
                value={formData.leadershipPlan.project12Months}
                onChange={(e) => setFormData({
                  ...formData,
                  leadershipPlan: {
                    ...formData.leadershipPlan,
                    project12Months: e.target.value
                  }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe el proyecto principal que liderarías..."
              />
            </div>

            {/* Métricas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Métricas de Éxito
              </label>
              {formData.leadershipPlan.metrics.map((metric, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={metric}
                    onChange={(e) => handleMetricChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Métrica ${index + 1}`}
                  />
                  {formData.leadershipPlan.metrics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMetric}
                className="flex items-center text-purple-600 hover:text-purple-800 text-sm"
              >
                <FaPlus className="mr-1" /> Agregar Métrica
              </button>
            </div>

            {/* Compromiso Operativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compromiso Operativo (8-12 horas/mes)
              </label>
              <textarea
                value={formData.leadershipPlan.operationalCommitment}
                onChange={(e) => setFormData({
                  ...formData,
                  leadershipPlan: {
                    ...formData.leadershipPlan,
                    operationalCommitment: e.target.value
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe cómo planeas cumplir con el compromiso operativo..."
              />
            </div>

            {/* Confirmación de Disponibilidad */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability"
                checked={formData.leadershipPlan.availabilityConfirmation}
                onChange={(e) => setFormData({
                  ...formData,
                  leadershipPlan: {
                    ...formData.leadershipPlan,
                    availabilityConfirmation: e.target.checked
                  }
                })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="availability" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Confirmo mi disponibilidad para cumplir con el compromiso operativo de 8-12 horas mensuales
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Personal y Experiencia
            </h3>
            
            {/* Declaración Personal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Declaración Personal
              </label>
              <textarea
                value={formData.personalStatement}
                onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="¿Por qué quieres ser Leader? ¿Qué te motiva a liderar BSKMT?"
              />
            </div>

            {/* Experiencia Relevante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experiencia Relevante
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe tu experiencia en liderazgo, tanto dentro como fuera de BSKMT..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Avales y Endorsements
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Requieres mínimo 3 avales de Leaders activos y 5 avales de Masters activos.
              </p>
            </div>

            {/* Avales Actuales */}
            {formData.endorsements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Avales Solicitados</h4>
                <div className="space-y-2">
                  {formData.endorsements.map((endorsement) => (
                    <div key={endorsement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <span className="font-medium">{endorsement.userName}</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          ({endorsement.userType === 'leader' ? 'Leader' : 'Master'})
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        endorsement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        endorsement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {endorsement.status === 'approved' ? 'Aprobado' :
                         endorsement.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solicitar Nuevos Avales */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Solicitar Nuevos Avales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableEndorsers.map((endorser) => (
                  <div key={endorser.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{endorser.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{endorser.membershipType}</p>
                      </div>
                      <button
                        onClick={() => requestEndorsement(endorser.id, endorser.membershipType.toLowerCase() as 'leader' | 'master')}
                        disabled={formData.endorsements.some(e => e.userId === endorser.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-400"
                      >
                        {formData.endorsements.some(e => e.userId === endorser.id) ? 'Solicitado' : 'Solicitar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Documentos de Apoyo
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Subir documentos de apoyo (opcional)
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData({
                          ...formData,
                          documents: Array.from(e.target.files)
                        });
                      }
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX hasta 10MB cada uno
                </p>
              </div>
            </div>

            {formData.documents.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documentos Seleccionados</h4>
                <ul className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={() => {
                          const newDocs = formData.documents.filter((_, i) => i !== index);
                          setFormData({ ...formData, documents: newDocs });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Revisión y Envío
            </h3>
            
            {/* Resumen de la postulación */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Resumen de Postulación</h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Plan de Liderazgo:</span>
                  <span className={formData.leadershipPlan.vision ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {formData.leadershipPlan.vision ? 'Completo' : 'Incompleto'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Declaración Personal:</span>
                  <span className={formData.personalStatement ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {formData.personalStatement ? 'Completo' : 'Incompleto'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Avales Leaders:</span>
                  <span className={`ml-2 ${
                    formData.endorsements.filter(e => e.userType === 'leader' && e.status === 'approved').length >= 3 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.endorsements.filter(e => e.userType === 'leader' && e.status === 'approved').length}/3
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Avales Masters:</span>
                  <span className={`ml-2 ${
                    formData.endorsements.filter(e => e.userType === 'master' && e.status === 'approved').length >= 5 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.endorsements.filter(e => e.userType === 'master' && e.status === 'approved').length}/5
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Documentos:</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {formData.documents.length} archivos
                  </span>
                </div>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Términos y Condiciones
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• La postulación será revisada por la Comisión Evaluadora</li>
                <li>• Se requiere entrevista pública ante la comunidad</li>
                <li>• Votación consultiva del 50%+1 de miembros activos</li>
                <li>• Ratificación final por Presidencia y Directiva</li>
                <li>• Mandato de 12 meses renovable</li>
                <li>• Disponibilidad operativa de 8-12 horas mensuales</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Postulación para Membresía Leader
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Proceso formal de postulación para cargo de liderazgo en BSKMT
        </p>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-purple-600 dark:bg-purple-400' : 'bg-gray-300 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
  <div className="p-6 bg-white dark:bg-gray-800">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <FaExclamationTriangle className="text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <FaCheckCircle className="text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex space-x-4">
            <button
              onClick={saveAsDraft}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center"
            >
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              Guardar Borrador
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-500"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={submitApplication}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-500 disabled:opacity-50 flex items-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                Enviar Postulación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderApplicationPlatform;