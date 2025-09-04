'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import UserTable from '@/components/admin/UserTable';
import { 
  FaSpinner, 
  FaUsers, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaArrowLeft
} from 'react-icons/fa';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  isActive: boolean;
  role: string;
  joinDate: string;
  lastLogin?: string;
  isEmailVerified: boolean;
}

export default function AdminUsersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          search: searchTerm,
          role: filterRole,
          membershipType: filterMembership,
          status: filterStatus
        });

        const response = await fetch(`/api/admin/users?${params}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      loadUsers();
    }
  }, [user, currentPage, searchTerm, filterRole, filterMembership, filterStatus]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        ));
      }
    } catch (error) {
      console.error('Error cambiando status del usuario:', error);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: newRole } : u
        ));
      }
    } catch (error) {
      console.error('Error cambiando rol del usuario:', error);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length 
        ? [] 
        : users.map(u => u._id)
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userIds: selectedUsers,
          action 
        })
      });

      if (response.ok) {
        // Recargar usuarios
        window.location.reload();
      }
    } catch (error) {
      console.error('Error en acción masiva:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Volver al Panel de Administración
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Gestión de Usuarios" description="Administrar usuarios registrados">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <Link href="/admin" className="mr-3 lg:mr-4">
                <FaArrowLeft className="text-lg lg:text-xl text-gray-600 hover:text-gray-900" />
              </Link>
              <FaUsers className="text-xl lg:text-2xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Administrar usuarios registrados</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <button
                onClick={() => handleBulkAction('export')}
                className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FaDownload className="mr-2" />
                Exportar
              </button>
              <Link
                href="/admin/users/new"
                className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FaPlus className="mr-2" />
                Nuevo Usuario
              </Link>
            </div>
          </div>
        </div>
      </div>
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los roles</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membresía
              </label>
              <select
                value={filterMembership}
                onChange={(e) => setFilterMembership(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las membresías</option>
                <option value="friend">Friend</option>
                <option value="rider">Rider</option>
                <option value="rider-duo">Rider Duo</option>
                <option value="pro">Pro</option>
                <option value="pro-duo">Pro Duo</option>
              </select>
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
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Acciones Masivas */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedUsers.length} usuario(s) seleccionado(s)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Activar
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Desactivar
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Exportar Seleccionados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Usuarios */}
        {loadingUsers ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          <UserTable
            users={users}
            onToggleStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            allSelected={selectedUsers.length === users.length && users.length > 0}
          />
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
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
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
