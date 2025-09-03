'use client';

import { useAuth } from '@/hooks/useAuth';
import { FaSpinner, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export default function DashboardPage() {
  const { user, logout, isLoading, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No estás autenticado</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Control
            </h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjeta de Bienvenida */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUserCircle className="text-6xl text-blue-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                ¡Bienvenido, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-gray-600">
                Tipo de membresía: <span className="font-medium capitalize">{user.membershipType}</span>
              </p>
              <p className="text-gray-600">
                Email: <span className="font-medium">{user.email}</span>
              </p>
              {user.isEmailVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  Email Verificado
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  Email Pendiente de Verificación
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Perfil */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUser className="text-2xl text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
                <p className="text-gray-600 text-sm">Gestiona tu información personal</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Ver Perfil
              </button>
            </div>
          </div>

          {/* Eventos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-2xl text-green-600 mr-4">📅</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Mis Eventos</h3>
                <p className="text-gray-600 text-sm">Eventos registrados y próximos</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Ver Eventos
              </button>
            </div>
          </div>

          {/* Membresía */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-2xl text-purple-600 mr-4">🏆</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Mi Membresía</h3>
                <p className="text-gray-600 text-sm">Estado y beneficios</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Eventos Asistidos</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Rutas Completadas</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Cursos Tomados</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Compras Realizadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
