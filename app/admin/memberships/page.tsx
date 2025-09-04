'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
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
  FaDownload,
  FaFilter,
  FaUser,
  FaCalendarAlt,
  FaMotorcycle
} from 'react-icons/fa';

interface MembershipApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  documentType: string;
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  motorcycleBrand?: string;
  motorcycleModel?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export default function AdminMembershipsPage() {
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMembershipType, setFilterMembershipType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // Cargar solicitudes de membresía
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoadingApplications(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          search: searchTerm,
          status: filterStatus,
          membershipType: filterMembershipType
        });

        const response = await fetch(`/api/admin/memberships?${params}`);
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
      } finally {
        setLoadingApplications(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      loadApplications();
    }
  }, [user, currentPage, searchTerm, filterStatus, filterMembershipType]);

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/memberships/${applicationId}/approve`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app._id === applicationId 
            ? { ...app, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.email }
            : app
        ));
      }
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Motivo del rechazo (opcional):');
    
    try {
      const response = await fetch(`/api/admin/memberships/${applicationId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app._id === applicationId 
            ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: user?.email }
            : app
        ));
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) return;

    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'aprobar' : 'rechazar'} ${selectedApplications.length} solicitud(es)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/memberships/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationIds: selectedApplications,
          action 
        })
      });

      if (response.ok) {
        // Recargar aplicaciones
        window.location.reload();
      }
    } catch (error) {
      console.error('Error en acción masiva:', error);
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === applications.length 
        ? [] 
        : applications.map(app => app._id)
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-600" />;
      case 'approved':
        return <FaCheck className="text-green-600" />;
      case 'rejected':
        return <FaTimes className="text-red-600" />;
      default:
        return null;
    }
  };

  const getMembershipTypeBadge = (type: string) => {
    const badges = {
      friend: 'bg-blue-100 text-blue-800',
      rider: 'bg-green-100 text-green-800',
      'rider-duo': 'bg-purple-100 text-purple-800',
      pro: 'bg-orange-100 text-orange-800',
      'pro-duo': 'bg-red-100 text-red-800'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Gestión de Membresías" description="Administrar solicitudes de membresía">
      <div className="p-6">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre, email, documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Membresía
              </label>
              <select
                value={filterMembershipType}
                onChange={(e) => setFilterMembershipType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="friend">Friend</option>
                <option value="rider">Rider</option>
                <option value="rider-duo">Rider Duo</option>
                <option value="pro">Pro</option>
                <option value="pro-duo">Pro Duo</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleBulkAction('export')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Acciones Masivas */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedApplications.length} solicitud(es) seleccionada(s)
              </span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Aprobar Seleccionadas
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Rechazar Seleccionadas
              </button>
            </div>
          )}
        </div>

        {/* Lista de Solicitudes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Membresía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motocicleta
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
                {loadingApplications ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Cargando solicitudes...</p>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron solicitudes de membresía
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application._id)}
                          onChange={() => handleSelectApplication(application._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUser className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.firstName} {application.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{application.documentType}</div>
                        <div className="text-gray-600">{application.documentNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMembershipTypeBadge(application.membershipType)}`}>
                          {application.membershipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.motorcycleBrand && application.motorcycleModel ? (
                          <div className="flex items-center">
                            <FaMotorcycle className="text-blue-500 mr-2" />
                            <div>
                              <div>{application.motorcycleBrand}</div>
                              <div className="text-gray-600">{application.motorcycleModel}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No especificada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(application.status)}`}>
                            {application.status === 'pending' ? 'Pendiente' : 
                             application.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {new Date(application.createdAt).toLocaleDateString('es-ES')}
                        </div>
                        {application.reviewedAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Revisada: {new Date(application.reviewedAt).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/memberships/${application._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Link>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveApplication(application._id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Aprobar"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleRejectApplication(application._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
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
                      Página <span className="font-medium">{currentPage}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
