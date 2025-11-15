'use client';

import { useState, useEffect, type FC } from 'react';
import { getCSRFToken } from '@/lib/csrf-client';
import CreateVotingModal from './CreateVotingModal';
import { 
  FaVoteYea, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaEye,
  FaPlay,
  FaStop,
  FaPlus,
  FaSpinner,
  FaCalendarAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

interface VotingProcess {
  id: string;
  title: string;
  description: string;
  type: 'leader_application' | 'general_proposal' | 'disciplinary' | 'policy_change';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  votes: {
    total: number;
    for: number;
    against: number;
    abstain: number;
    participation: number;
  };
  eligibleVoters: {
    total: number;
    leaders: number;
    masters: number;
  };
  settings: {
    requiresQuorum: boolean;
    quorumPercentage: number;
    allowAbstention: boolean;
    isSecret: boolean;
    resultsVisible: boolean;
  };
  createdBy: string;
  createdAt: string;
}

interface VoteRecord {
  id: string;
  votingProcessId: string;
  voterId: string;
  voterEmail: string;
  voterMembershipType: string;
  vote: 'for' | 'against' | 'abstain';
  timestamp: string;
  comment?: string;
}

interface VotingSystemProps {
  className?: string;
}

const VotingSystem: FC<VotingSystemProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [votingProcesses, setVotingProcesses] = useState<VotingProcess[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<VotingProcess | null>(null);
  const [userVotes, setUserVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    void fetchVotingData();
  }, [activeTab]);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leadership/voting?status=${activeTab}`);
      if (response.ok) {
        const result = await response.json();
        setVotingProcesses(result.data.processes);
        setUserVotes(result.data.userVotes);
      } else {
        setError('Error al cargar procesos de votación');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (processId: string, vote: 'for' | 'against' | 'abstain', comment?: string) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/leadership/voting/${processId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({ vote, comment }),
      });

      if (response.ok) {
        await fetchVotingData(); // Recargar datos
        // Mostrar mensaje de éxito
      } else {
        const error = await response.json();
        setError(error.message || 'Error al registrar voto');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setError(error instanceof Error ? error.message : 'Error al votar');
    }
  };

  const controlVotingProcess = async (processId: string, action: 'start' | 'stop' | 'cancel') => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/leadership/voting/${processId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchVotingData(); // Recargar datos
      } else {
        const error = await response.json();
        setError(error.message || 'Error al controlar proceso');
      }
    } catch (error) {
      console.error('Error controlling process:', error);
      setError(error instanceof Error ? error.message : 'Error al controlar proceso');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return FaPlay;
      case 'completed': return FaCheckCircle;
      case 'cancelled': return FaTimesCircle;
      default: return FaClock;
    }
  };

  const calculateProgress = (process: VotingProcess) => {
    if (process.eligibleVoters.total === 0) return 0;
    return (process.votes.total / process.eligibleVoters.total) * 100;
  };

  const hasUserVoted = (processId: string) => {
    return userVotes.some(vote => vote.votingProcessId === processId);
  };

  const getUserVote = (processId: string) => {
    return userVotes.find(vote => vote.votingProcessId === processId);
  };

  const tabs = [
    { id: 'active', label: 'Activos', icon: FaPlay },
    { id: 'completed', label: 'Completados', icon: FaCheckCircle },
    { id: 'draft', label: 'Borradores', icon: FaClock },
    { id: 'all', label: 'Todos', icon: FaVoteYea }
  ];

  const renderVotingCard = (process: VotingProcess) => {
    const progress = calculateProgress(process);
    const userVote = getUserVote(process.id);
    const StatusIcon = getStatusIcon(process.status);
    const hasVoted = hasUserVoted(process.id);

    return (
  <div key={process.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-purple-500 dark:border-purple-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <StatusIcon className={`mr-2 ${getStatusColor(process.status)}`} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {process.title}
              </h3>
              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                process.status === 'active' ? 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800' :
                process.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900 dark:text-blue-200 text-blue-800' :
                process.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-800' :
                'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 text-gray-800'
              }`}>
                {process.status === 'active' ? 'Activo' :
                 process.status === 'completed' ? 'Completado' :
                 process.status === 'cancelled' ? 'Cancelado' : 'Borrador'}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {process.description}
            </p>

            {process.candidateName && (
              <div className="flex items-center mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <FaUserCheck className="text-purple-600 mr-2" />
                <span className="text-sm font-medium">
                  Candidato: {process.candidateName} ({process.candidateEmail})
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{process.votes.for}</div>
                <div className="text-gray-500 dark:text-gray-300">A Favor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{process.votes.against}</div>
                <div className="text-gray-500 dark:text-gray-300">En Contra</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{process.votes.abstain}</div>
                <div className="text-gray-500 dark:text-gray-300">Abstención</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{process.votes.total}</div>
                <div className="text-gray-500 dark:text-gray-300">Total</div>
              </div>
            </div>

            {/* Barra de progreso de participación */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Participación</span>
                <span>{progress.toFixed(1)}% ({process.votes.total}/{process.eligibleVoters.total})</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden relative">
                <div 
                  className="absolute left-0 top-0 bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
                  ref={(el) => {
                    if (el) {
                      el.style.width = `${Math.min(100, Math.max(0, progress))}%`;
                    }
                  }}
                ></div>
              </div>
            </div>

            {/* Información de fechas */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                Inicio: {new Date(process.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                Fin: {new Date(process.endDate).toLocaleDateString()}
              </div>
            </div>

            {/* Estado de voto del usuario */}
            {hasVoted && userVote && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Ya votaste: {userVote.vote === 'for' ? 'A Favor' : 
                                userVote.vote === 'against' ? 'En Contra' : 'Abstención'}
                  </span>
                </div>
                {userVote.comment && (
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Comentario: {userVote.comment}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col space-y-2 ml-4">
            <button 
              onClick={() => setSelectedProcess(process)}
              className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <FaEye className="mr-1" />
              Ver Detalles
            </button>

            {process.status === 'active' && !hasVoted && (
              <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => castVote(process.id, 'for')}
                  className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded text-sm hover:bg-green-700 dark:hover:bg-green-800"
                >
                  <FaCheckCircle className="mr-1 inline" />
                  A Favor
                </button>
                <button 
                  onClick={() => castVote(process.id, 'against')}
                  className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-800"
                >
                  <FaTimesCircle className="mr-1 inline" />
                  En Contra
                </button>
                {process.settings.allowAbstention && (
                    <button 
                      onClick={() => castVote(process.id, 'abstain')}
                      className="px-3 py-1 bg-yellow-600 dark:bg-yellow-700 text-white rounded text-sm hover:bg-yellow-700 dark:hover:bg-yellow-800"
                    >
                    <FaQuestionCircle className="mr-1 inline" />
                    Abstención
                  </button>
                )}
              </div>
            )}

            {process.status === 'draft' && (
              <button 
                onClick={() => controlVotingProcess(process.id, 'start')}
                className="px-3 py-1 bg-purple-600 dark:bg-purple-700 text-white rounded text-sm hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
              >
                <FaPlay className="mr-1" />
                Iniciar
              </button>
            )}

            {process.status === 'active' && (
              <button 
                onClick={() => controlVotingProcess(process.id, 'stop')}
                className="px-3 py-1 bg-orange-600 dark:bg-orange-700 text-white rounded text-sm hover:bg-orange-700 dark:hover:bg-orange-800 flex items-center"
              >
                <FaStop className="mr-1" />
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedProcess) return null;

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProcess.title}
              </h2>
              <button 
                onClick={() => setSelectedProcess(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Información general */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Votación
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedProcess.type === 'leader_application' ? 'Postulación Leader' :
                     selectedProcess.type === 'general_proposal' ? 'Propuesta General' :
                     selectedProcess.type === 'disciplinary' ? 'Proceso Disciplinario' :
                     'Cambio de Política'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedProcess.status === 'active' ? 'Activo' :
                     selectedProcess.status === 'completed' ? 'Completado' :
                     selectedProcess.status === 'cancelled' ? 'Cancelado' : 'Borrador'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Inicio
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(selectedProcess.startDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Fin
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(selectedProcess.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción completa */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Descripción
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedProcess.description}
              </p>
            </div>

            {/* Resultados detallados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Resultados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Votos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>A Favor:</span>
                      <span className="font-semibold text-green-600">{selectedProcess.votes.for}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En Contra:</span>
                      <span className="font-semibold text-red-600">{selectedProcess.votes.against}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abstenciones:</span>
                      <span className="font-semibold text-yellow-600">{selectedProcess.votes.abstain}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">{selectedProcess.votes.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Elegibles</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Leaders:</span>
                      <span className="font-semibold">{selectedProcess.eligibleVoters.leaders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Masters:</span>
                      <span className="font-semibold">{selectedProcess.eligibleVoters.masters}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{selectedProcess.eligibleVoters.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Configuración
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Requiere Quórum:</span>
                  <span className="ml-2 text-sm font-medium">
                    {selectedProcess.settings.requiresQuorum ? 
                      `Sí (${selectedProcess.settings.quorumPercentage}%)` : 'No'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Permite Abstención:</span>
                  <span className="ml-2 text-sm font-medium">
                    {selectedProcess.settings.allowAbstention ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Votación Secreta:</span>
                  <span className="ml-2 text-sm font-medium">
                    {selectedProcess.settings.isSecret ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Resultados Visibles:</span>
                  <span className="ml-2 text-sm font-medium">
                    {selectedProcess.settings.resultsVisible ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-red-600 dark:text-red-400 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <p>{error}</p>
          <button 
            onClick={fetchVotingData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaVoteYea className="text-3xl text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sistema de Votación Consultiva
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestión de procesos electorales y decisiones colegiadas
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
          >
            <FaPlus className="mr-2" />
            Nueva Votación
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {votingProcesses.length === 0 ? (
          <div className="text-center py-12">
            <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay procesos de votación en esta categoría
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {votingProcesses.map(renderVotingCard)}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {renderDetailModal()}

      {/* Modal de creación */}
      <CreateVotingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchVotingData}
      />
    </div>
  );
};

export default VotingSystem;