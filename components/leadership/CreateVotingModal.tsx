'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTimes, 
  FaCalendarAlt,
  FaUsers,
  FaUserCheck,
  FaCogs,
  FaSpinner,
  FaSearch
} from 'react-icons/fa';

interface CreateVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  membershipType: string;
}

const CreateVotingModal: React.FC<CreateVotingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general_proposal',
    startDate: '',
    endDate: '',
    candidateId: '',
    settings: {
      requiresQuorum: true,
      quorumPercentage: 50,
      allowAbstention: true,
      isSecret: false,
      resultsVisible: true
    }
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen && formData.type === 'leader_application') {
      fetchCandidates();
    }
  }, [isOpen, formData.type]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/membership/available-endorsers');
      if (response.ok) {
        const result = await response.json();
        // Filtrar para mostrar solo candidatos potenciales (no Leaders o Masters actuales)
        const potentialCandidates = result.data.filter((user: any) => 
          user.membershipType !== 'leader' && user.membershipType !== 'master'
        );
        setCandidates(potentialCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leadership/voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const result = await response.json();
        setError(result.error || 'Error al crear el proceso de votación');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'general_proposal',
      startDate: '',
      endDate: '',
      candidateId: '',
      settings: {
        requiresQuorum: true,
        quorumPercentage: 50,
        allowAbstention: true,
        isSecret: false,
        resultsVisible: true
      }
    });
    setStep(1);
    setError(null);
    setSearchTerm('');
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Información Básica';
      case 2: return 'Configuración de Fechas';
      case 3: return 'Configuración Avanzada';
      default: return 'Nueva Votación';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
        {/* Header */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nueva Votación
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Paso {step} de 3: {getStepTitle()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
              aria-label="Cerrar"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex-1 h-2 rounded-full ${
                    stepNumber <= step ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
  <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-b-lg">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Título de la Votación
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej. Votación para Leader - Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tipo de Votación
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, candidateId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="general_proposal">Propuesta General</option>
                  <option value="leader_application">Postulación Leader</option>
                  <option value="policy_change">Cambio de Política</option>
                  <option value="disciplinary">Proceso Disciplinario</option>
                </select>
              </div>

              {formData.type === 'leader_application' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <FaUserCheck className="inline mr-2" />
                    Candidato
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Buscar candidato..."
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                      {filteredCandidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, candidateId: candidate.id })}
                          className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                            formData.candidateId === candidate.id ? 'bg-purple-50 dark:bg-purple-900/30' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {candidate.email}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded">
                              {candidate.membershipType}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Describe el propósito y detalles de esta votación..."
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Fecha y Hora de Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Información sobre Fechas
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• La votación se iniciará automáticamente en la fecha programada</li>
                  <li>• Solo Leaders y Masters pueden votar</li>
                  <li>• Se pueden extender las fechas si es necesario</li>
                  <li>• Se enviará notificación cuando inicie y termine</li>
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FaCogs className="inline mr-2" />
                Configuración Avanzada
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Requiere Quórum
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Porcentaje mínimo de participación para validar la votación
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.requiresQuorum}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, requiresQuorum: e.target.checked }
                    })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>

                {formData.settings.requiresQuorum && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Porcentaje de Quórum (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.settings.quorumPercentage}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, quorumPercentage: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Permitir Abstención
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Los votantes pueden abstenerse de votar
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowAbstention}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowAbstention: e.target.checked }
                    })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Votación Secreta
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Los votos individuales no serán visibles
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.isSecret}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, isSecret: e.target.checked }
                    })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Resultados Visibles
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Los resultados parciales son visibles durante la votación
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.resultsVisible}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, resultsVisible: e.target.checked }
                    })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Anterior
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : step < 3 ? (
                  'Siguiente'
                ) : (
                  'Crear Votación'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVotingModal;