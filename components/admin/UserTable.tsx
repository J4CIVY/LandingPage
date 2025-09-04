'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaEdit,
  FaTrash,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaUserShield,
  FaChevronDown,
  FaChevronUp
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

interface UserTableProps {
  users: User[];
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}

export default function UserTable({ 
  users, 
  onToggleStatus, 
  onDeleteUser, 
  selectedUsers, 
  onSelectUser, 
  onSelectAll, 
  allSelected 
}: UserTableProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      'super-admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'user': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles] || styles.user}`}>
        {role === 'super-admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
      </span>
    );
  };

  const getMembershipBadge = (membershipType: string) => {
    const styles = {
      'premium': 'bg-yellow-100 text-yellow-800',
      'basic': 'bg-blue-100 text-blue-800',
      'none': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[membershipType as keyof typeof styles] || styles.none}`}>
        {membershipType === 'premium' ? 'Premium' : membershipType === 'basic' ? 'Básico' : 'Sin membresía'}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Membresía
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Último Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => onSelectUser(user._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      {!user.isEmailVerified && (
                        <span className="text-xs text-orange-600 dark:text-orange-400">Email no verificado</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4">
                  {getMembershipBadge(user.membershipType)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      href={`/admin/users/${user._id}/edit`}
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => onToggleStatus(user._id, user.isActive)}
                      className={`p-1 ${
                        user.isActive 
                          ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' 
                          : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                      }`}
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {user.isActive ? <FaUserTimes /> : <FaUserCheck />}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {users.map((user) => {
          const isExpanded = expandedRows.includes(user._id);
          return (
            <div key={user._id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => onSelectUser(user._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(user._id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                <div className="mt-2 flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                  {getMembershipBadge(user.membershipType)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Último Login:</span>
                        <div className="font-medium">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Registro:</span>
                        <div className="font-medium">{formatDate(user.joinDate)}</div>
                      </div>
                    </div>

                    {!user.isEmailVerified && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        Email no verificado
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200"
                        title="Ver detalles"
                      >
                        <FaEye className="text-sm" />
                      </Link>
                      <Link
                        href={`/admin/users/${user._id}/edit`}
                        className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200"
                        title="Editar"
                      >
                        <FaEdit className="text-sm" />
                      </Link>
                      <button
                        onClick={() => onToggleStatus(user._id, user.isActive)}
                        className={`p-2 rounded-full ${
                          user.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {user.isActive ? <FaUserTimes className="text-sm" /> : <FaUserCheck className="text-sm" />}
                      </button>
                      <button
                        onClick={() => onDeleteUser(user._id)}
                        className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200"
                        title="Eliminar"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
