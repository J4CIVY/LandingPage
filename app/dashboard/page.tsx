'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardEvents from '@/components/dashboard/DashboardEvents';
import { 
  FaSpinner, 
  FaUser, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaEdit, 
  FaCalendarAlt,
  FaMotorcycle,
  FaShoppingCart,
  FaRoute,
  FaGraduationCap,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaMedal,
  FaChartLine,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCertificate,
  FaHistory,
  FaCheck,
  FaArrowRight,
  FaCalendarCheck,
  FaCalendarPlus,
  FaCloudSun,
  FaBookOpen
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user, logout, isLoading, isAuthenticated, isInitialized } = useAuth();
  
  // Configuración de estadísticas del usuario
  const [stats, setStats] = useState({
    eventsAttended: 12,
    routesCompleted: 8,
    coursesTaken: 3,
    purchases: 5,
    totalKilometers: 1245,
    totalKm: 1245, // Alias para compatibilidad
    memberSince: 'Enero 2023',
    safetyScore: 94,
    coursesCompleted: 3 // Alias para compatibilidad
  });

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-300 text-lg">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado DESPUÉS de la inicialización, mostrar mensaje de acceso requerido
  if (!isAuthenticated || !user) {
    console.log('Dashboard: Usuario no autenticado', { isAuthenticated, user: !!user, isInitialized });
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <FaUserCircle className="text-6xl text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Debes iniciar sesión para acceder a tu panel de control</p>
          <Link
            href="/login?returnUrl=/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <FaUser className="mr-2" />
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const membershipColors = {
    friend: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rider: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'rider-duo': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    pro: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'pro-duo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header del Dashboard */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <FaUserCircle className="text-xl sm:text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Panel de Control
                </h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
                  Bienvenido de nuevo, {user.firstName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 relative transition-colors">
                <FaBell className="text-lg sm:text-xl" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  3
                </span>
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 dark:focus:ring-offset-slate-800 transition-colors"
              >
                <FaSignOutAlt className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tarjeta de Perfil del Usuario */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex-shrink-0 self-center sm:self-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-3xl sm:text-4xl text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 dark:text-slate-400 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                  <FaEnvelope className="mr-2 text-xs sm:text-sm" />
                  {user.email}
                </p>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium ${membershipColors[user.membershipType as keyof typeof membershipColors]}`}>
                    <FaMedal className="mr-1 text-xs" />
                    {user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1)}
                  </span>
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <FaCertificate className="mr-1" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pendiente Verificación
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">
                  Miembro desde {stats.memberSince}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                <FaEdit className="mr-2" />
                Editar Perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Eventos Asistidos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{stats.eventsAttended}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">+2 este mes</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FaCalendarAlt className="text-lg sm:text-2xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Kilómetros Recorridos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{stats.totalKm.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">+250 km esta semana</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FaMotorcycle className="text-lg sm:text-2xl text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Nivel de Seguridad</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{stats.safetyScore}%</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">Excelente</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FaShieldAlt className="text-lg sm:text-2xl text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Cursos Completados</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{stats.coursesCompleted}</p>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">1 en progreso</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FaGraduationCap className="text-lg sm:text-2xl text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Secciones Principales */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Actividades Recientes */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <FaHistory className="mr-2 text-blue-600 dark:text-blue-400" />
                  Actividades Recientes
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex-shrink-0">
                      <FaCheck className="text-green-600 dark:text-green-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">Ruta completada: Cordillera Central</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">hace 2 días • 180 km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full flex-shrink-0">
                      <FaCalendarAlt className="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">Inscrito al evento: Rodada de Primavera</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">hace 5 días • 15 de Abril</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full flex-shrink-0">
                      <FaGraduationCap className="text-purple-600 dark:text-purple-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">Curso completado: Seguridad Vial Avanzada</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">hace 1 semana • Certificado obtenido</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full flex-shrink-0">
                      <FaMedal className="text-yellow-600 dark:text-yellow-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">Logro desbloqueado: Explorador</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">hace 1 semana • 5 rutas completadas</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href="/activity"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
                  >
                    Ver toda la actividad
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Próximos Eventos - Componente mejorado */}
            <DashboardEvents />

            {/* Acciones Rápidas */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Acciones Rápidas</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <Link
                    href="/sos"
                    className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <FaPhoneAlt className="mr-3 text-sm sm:text-base" />
                    <span className="font-medium text-sm sm:text-base">Emergencia SOS</span>
                  </Link>
                  
                  <Link
                    href="/weather"
                    className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <FaCloudSun className="mr-3 text-sm sm:text-base" />
                    <span className="font-medium text-sm sm:text-base">Estado del Clima</span>
                  </Link>
                  
                  <Link
                    href="/courses"
                    className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <FaBookOpen className="mr-3 text-sm sm:text-base" />
                    <span className="font-medium text-sm sm:text-base">Cursos Disponibles</span>
                  </Link>
                  
                  <Link
                    href="/store"
                    className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <FaShoppingCart className="mr-3 text-sm sm:text-base" />
                    <span className="font-medium text-sm sm:text-base">Tienda</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
