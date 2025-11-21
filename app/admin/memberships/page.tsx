'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaSpinner, 
  FaIdCard, 
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaPlus,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEdit
} from 'react-icons/fa';

// Interfaz para los datos de solicitudes de membresía
interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  age?: number;
  city?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  ridingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewDate?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  orientationCompleted?: boolean;
  orientationDate?: string;
  membershipStartDate?: string;
  membershipNumber?: string;
  referredBy?: string;
  source?: 'website' | 'referral' | 'event' | 'social-media' | 'other';
  createdAt: string;
  updatedAt: string;
}

const membershipTypeNames: Record<string, string> = {
  'friend': 'Amigo',
  'rider': 'Piloto',
  'rider-duo': 'Piloto Dúo',
  'pro': 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
};

const statusNames: Record<string, string> = {
  'pending': 'Pendiente',
  'approved': 'Aprobada',
  'rejected': 'Rechazada'
};

export default function MembershipsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMembershipType, setFilterMembershipType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Verificar autenticación y roles
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router]);

  // Cargar solicitudes de membresía
  useEffect(() => {
    const loadApplications = async () => {
      if (!user || !['admin', 'super-admin'].includes(user.role)) return;

      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          search: searchTerm,
          sortBy,
          sortOrder
        });

        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (filterMembershipType !== 'all') params.append('membershipType', filterMembershipType);

        const apiClient = (await import('@/lib/api-client')).default;
        const data = await apiClient.get(`/admin/memberships?${params.toString()}`) as {
          applications?: typeof applications;
          statistics?: typeof statistics;
          pagination?: { totalPages: number };
        };
        
        setApplications(data.applications || []);
        setStatistics(data.statistics || { total: 0, pending: 0, approved: 0, rejected: 0 });
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, [user, currentPage, searchTerm, filterStatus, filterMembershipType, sortBy, sortOrder]);

  // Aprobar solicitud de membresía
  const handleApproveApplication = async (applicationId: string) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post(`/admin/memberships/${applicationId}/approve`, {
        reviewedBy: user?.id,
        reviewedByName: `${user?.firstName} ${user?.lastName}`,
        approvalNotes: 'Aprobado desde panel de administración'
      });

      setApplications(applications.map(app => 
        app._id === applicationId 
          ? { ...app, status: 'approved', reviewDate: new Date().toISOString(), reviewedByName: `${user?.firstName} ${user?.lastName}` }
          : app
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Rechazar solicitud de membresía
  const handleRejectApplication = async (applicationId: string) => {
    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post(`/admin/memberships/${applicationId}/reject`, {
        reviewedBy: user?.id,
        reviewedByName: `${user?.firstName} ${user?.lastName}`,
        rejectionReason: 'Rechazado desde panel de administración'
      });

      setApplications(applications.map(app => 
        app._id === applicationId 
          ? { ...app, status: 'rejected', reviewDate: new Date().toISOString(), reviewedByName: `${user?.firstName} ${user?.lastName}` }
          : app
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Acciones masivas para múltiples solicitudes
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedApplications.length === 0) return;

    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'aprobar' : 'rechazar'} ${selectedApplications.length} solicitud(es)?`)) {
      return;
    }

    try {
      const apiClient = (await import('@/lib/api-client')).default;
      await apiClient.post(`/admin/memberships/bulk-${action}`, {
        applicationIds: selectedApplications,
        reviewedBy: user?.id,
        reviewedByName: `${user?.firstName} ${user?.lastName}`,
        notes: action === 'approve' ? 'Aprobado masivamente' : 'Rechazado masivamente'
      });

      // Recargar la lista
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Manejar selección individual
  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Seleccionar/deseleccionar todas
  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === applications.length 
        ? [] 
        : applications.map(app => app._id)
    );
  };

  // Mostrar loading mientras se autentica o carga los datos
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  // Verificar permisos
  if (!user || !['admin', 'super-admin'].includes(user.role)) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <FaExclamationTriangle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Sin permisos</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Membresías</h1>
            <p className="text-gray-600">Administra las solicitudes de membresía del motoclub</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/memberships/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaPlus />
              <span>Nueva Membresía</span>
            </Link>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FaDownload />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <FaIdCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Solicitudes</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <FaClock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <FaTimesCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>

            <div>
              <label htmlFor="filterMembershipType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Membresía
              </label>
              <select
                id="filterMembershipType"
                value={filterMembershipType}
                onChange={(e) => setFilterMembershipType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="friend">Amigo</option>
                <option value="rider">Piloto</option>
                <option value="rider-duo">Piloto Dúo</option>
                <option value="pro">Profesional</option>
                <option value="pro-duo">Profesional Dúo</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortByOrder" className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                id="sortByOrder"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Más recientes</option>
                <option value="createdAt-asc">Más antiguas</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="status-asc">Estado A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Acciones masivas */}
        {selectedApplications.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedApplications.length} solicitud(es) seleccionada(s)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaCheck />
                  <span>Aprobar seleccionadas</span>
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaTimes />
                  <span>Rechazar seleccionadas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de solicitudes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label="Seleccionar todas las solicitudes"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Cargando solicitudes...</p>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FaIdCard className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron solicitudes</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application._id)}
                          onChange={() => handleSelectApplication(application._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Seleccionar solicitud ${application._id}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.name}
                            </div>
                            {application.city && (
                              <div className="text-sm text-gray-500">{application.city}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                          <FaEnvelope className="text-gray-400" />
                          <span>{application.email}</span>
                        </div>
                        {application.phone && (
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <FaPhone className="text-gray-400" />
                            <span>{application.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {membershipTypeNames[application.membershipType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                          {statusNames[application.status]}
                        </span>
                        {application.reviewDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Revisada: {new Date(application.reviewDate).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/memberships/view/${application._id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`/admin/memberships/${application._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FaEdit />
                          </Link>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveApplication(application._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Aprobar"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleRejectApplication(application._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Rechazar"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
