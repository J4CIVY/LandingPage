'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, 
  FaUsers, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaArrowLeft,
  FaFilter,
  FaDownload,
  FaPlus,
  FaUserShield,
  FaUserMinus
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <FaArrowLeft className="text-xl text-gray-600 hover:text-gray-900" />
              </Link>
              <FaUsers className="text-2xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-sm text-gray-600">Administrar usuarios registrados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleBulkAction('export')}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Exportar
              </button>
              <Link
                href="/admin/users/new"
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Nuevo Usuario
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedUsers.length} usuario(s) seleccionado(s)
              </span>
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
          )}
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membresía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(userItem._id)}
                          onChange={() => handleSelectUser(userItem._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {userItem.firstName.charAt(0)}{userItem.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.firstName} {userItem.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userItem.isEmailVerified ? 'Verificado' : 'Sin verificar'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleChangeUserRole(userItem._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={user.role === 'admin' && userItem.role === 'super-admin'}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                          {user.role === 'super-admin' && (
                            <option value="super-admin">Super Admin</option>
                          )}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {userItem.membershipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/users/${userItem._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`/admin/users/${userItem._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleToggleUserStatus(userItem._id, userItem.isActive)}
                            className={`${
                              userItem.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {userItem.isActive ? <FaUserTimes /> : <FaUserCheck />}
                          </button>
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
      </main>
    </div>
  );
}
