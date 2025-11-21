'use client';

import { useState, useEffect, type FC } from 'react';
import apiClient from '@/lib/api-client';
import { 
  FaUserTie, 
  FaUsers, 
  FaClipboardList, 
  FaBullhorn,
  FaChartLine,
  FaCalendarAlt,
  FaCogs,
  FaComments,
  FaFileAlt,
  FaHandshake,
  FaGavel,
  FaBell,
  FaEye,
  FaEdit,
  FaPlus,
  FaCheck,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

interface LeaderStats {
  totalMembers: number;
  activeApplications: number;
  upcomingVotings: number;
  pendingDecisions: number;
  monthlyEvents: number;
  teamMembersManaged: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  membershipType: string;
  status: 'active' | 'inactive';
  assignedTasks: number;
  lastActivity: string;
}

interface PendingDecision {
  id: string;
  type: 'application' | 'vote' | 'proposal' | 'disciplinary';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  votes?: {
    for: number;
    against: number;
    abstain: number;
    total: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  targetAudience: string[];
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sent';
}

interface LeaderDashboardProps {
  className?: string;
}

const LeaderDashboard: FC<LeaderDashboardProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<LeaderStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<PendingDecision[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // NestJS: GET /leadership/dashboard
      const result = await apiClient.get<{ stats: LeaderStats; teamMembers: TeamMember[]; pendingDecisions: PendingDecision[]; announcements: Announcement[] }>('/leadership/dashboard');
      setStats(result.stats);
      setTeamMembers(result.teamMembers);
      setPendingDecisions(result.pendingDecisions);
      setAnnouncements(result.announcements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decisionId: string, action: 'approve' | 'reject', comment?: string) => {
    try {
      // NestJS: POST /leadership/decisions/:id
      await apiClient.post(`/leadership/decisions/${decisionId}`, { action, comment });
      await fetchDashboardData(); // Recargar datos
    } catch (error) {
      console.error('Error processing decision:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FaChartLine },
    { id: 'team', label: 'Equipo', icon: FaUsers },
    { id: 'decisions', label: 'Decisiones', icon: FaGavel },
    { id: 'communications', label: 'Comunicaciones', icon: FaBullhorn },
    { id: 'resources', label: 'Recursos', icon: FaCogs }
  ];

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
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Miembros Totales</p>
              <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
            </div>
            <FaUsers className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Postulaciones Activas</p>
              <p className="text-3xl font-bold">{stats?.activeApplications || 0}</p>
            </div>
            <FaClipboardList className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Votaciones Pendientes</p>
              <p className="text-3xl font-bold">{stats?.upcomingVotings || 0}</p>
            </div>
            <FaGavel className="text-4xl text-purple-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Decisiones Pendientes</p>
              <p className="text-3xl font-bold">{stats?.pendingDecisions || 0}</p>
            </div>
            <FaBell className="text-4xl text-orange-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">Eventos Este Mes</p>
              <p className="text-3xl font-bold">{stats?.monthlyEvents || 0}</p>
            </div>
            <FaCalendarAlt className="text-4xl text-teal-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Equipo Gestionado</p>
              <p className="text-3xl font-bold">{stats?.teamMembersManaged || 0}</p>
            </div>
            <FaHandshake className="text-4xl text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaPlus className="text-2xl text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Nuevo Anuncio</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaGavel className="text-2xl text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Nueva Votación</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaUsers className="text-2xl text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Gestionar Equipo</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaFileAlt className="text-2xl text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gestión de Equipo
        </h3>
  <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center">
          <FaPlus className="mr-2" />
          Agregar Miembro
        </button>
      </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Miembro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tareas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.membershipType}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {member.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800' 
                      : 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-800'
                  }`}>
                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {member.assignedTasks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-300">
                    <FaEdit />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-300">
                    <FaEye />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:hover:text-red-300">
                    <FaTimes />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDecisions = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Decisiones Pendientes
      </h3>

      <div className="space-y-4">
        {pendingDecisions.map((decision) => (
          <div key={decision.id} className="bg-white dark:bg-gray-900 rounded-lg p-6 border-l-4 border-purple-500 dark:border-purple-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mr-3">
                    {decision.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    decision.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-800' :
                    decision.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900 dark:text-orange-200 text-orange-800' :
                    decision.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 text-yellow-800' :
                    'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800'
                  }`}>
                    {decision.priority === 'urgent' ? 'Urgente' :
                     decision.priority === 'high' ? 'Alta' :
                     decision.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {decision.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  Fecha límite: {new Date(decision.deadline).toLocaleDateString()}
                </div>

                {decision.votes && (
                  <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 dark:text-green-400 font-semibold">{decision.votes.for}</div>
                      <div className="text-gray-500 dark:text-gray-300">A Favor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 dark:text-red-400 font-semibold">{decision.votes.against}</div>
                      <div className="text-gray-500 dark:text-gray-300">En Contra</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 dark:text-yellow-400 font-semibold">{decision.votes.abstain}</div>
                      <div className="text-gray-500 dark:text-gray-300">Abstención</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">{decision.votes.total}</div>
                      <div className="text-gray-500 dark:text-gray-300">Total</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => handleDecision(decision.id, 'approve')}
                  className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded text-sm hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
                >
                  <FaCheck className="mr-1" />
                  Aprobar
                </button>
                <button 
                  onClick={() => handleDecision(decision.id, 'reject')}
                  className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-800 flex items-center"
                >
                  <FaTimes className="mr-1" />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comunicaciones
        </h3>
  <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center">
          <FaPlus className="mr-2" />
          Nuevo Anuncio
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white dark:bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {announcement.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {announcement.content}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Audiencia: {announcement.targetAudience.join(', ')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      announcement.status === 'sent' ? 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800' :
                      announcement.status === 'scheduled' ? 'bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 text-yellow-800' :
                      'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 text-gray-800'
                    }`}>
                    {announcement.status === 'sent' ? 'Enviado' :
                     announcement.status === 'scheduled' ? 'Programado' : 'Borrador'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button className="p-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-300">
                  <FaEdit />
                </button>
                <button className="p-2 text-red-600 hover:text-red-800 dark:hover:text-red-300">
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recursos y Herramientas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaFileAlt className="text-3xl text-blue-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Documentos Oficiales
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Acceso a estatutos, reglamentos y documentos administrativos
          </p>
          <button className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
            Ver Documentos →
          </button>
        </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaChartLine className="text-3xl text-green-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Reportes y Analytics
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Estadísticas del club, métricas de participación y reportes
          </p>
          <button className="text-green-600 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium">
            Ver Reportes →
          </button>
        </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaComments className="text-3xl text-purple-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Canal Directivo
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Comunicación privada entre Leaders y Directiva
          </p>
          <button className="text-purple-600 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium">
            Abrir Canal →
          </button>
        </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaCogs className="text-3xl text-orange-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Herramientas Admin
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Gestión de usuarios, permisos y configuraciones
          </p>
          <button className="text-orange-600 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium">
            Acceder →
          </button>
        </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaHandshake className="text-3xl text-teal-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Convenios y Aliados
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Gestión de convenios con marcas y aliados estratégicos
          </p>
          <button className="text-teal-600 hover:text-teal-800 dark:hover:text-teal-300 text-sm font-medium">
            Gestionar →
          </button>
        </div>

  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FaCalendarAlt className="text-3xl text-indigo-600 mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Calendario Ejecutivo
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Reuniones, eventos y compromisos oficiales
          </p>
          <button className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
            Ver Calendario →
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'team':
        return renderTeam();
      case 'decisions':
        return renderDecisions();
      case 'communications':
        return renderCommunications();
      case 'resources':
        return renderResources();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <FaUserTie className="text-3xl text-purple-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard de Liderazgo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Herramientas de gestión operativa para Leaders activos
            </p>
          </div>
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
        {renderTabContent()}
      </div>
    </div>
  );
};

export default LeaderDashboard;
