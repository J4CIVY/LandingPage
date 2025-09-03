'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaSignOutAlt, FaUserCircle, FaTachometerAlt, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

export default function AuthButton() {
  const { isAuthenticated, user, logout, isLoading, isInitialized } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mostrar loading si no está inicializado
  if (!isInitialized) {
    return (
      <div className="flex items-center">
        <FaSpinner className="animate-spin text-gray-400 w-5 h-5" />
      </div>
    );
  }

  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex items-center">
        <FaSpinner className="animate-spin text-blue-600 w-5 h-5" />
      </div>
    );
  }

  // Si NO está autenticado, mostrar botón de login
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <FaUser className="mr-2 w-4 h-4" />
          Iniciar Sesión
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  // Si está autenticado, mostrar menú de usuario
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-colors"
      >
        <FaUserCircle className="w-8 h-8" />
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gray-500 capitalize">{user.membershipType}</div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Información del usuario */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-blue-600 capitalize mt-1">
              Membresía: {user.membershipType}
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTachometerAlt className="mr-3 w-4 h-4" />
              Panel de Control
            </Link>
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUser className="mr-3 w-4 h-4" />
              Mi Perfil
            </Link>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt className="mr-3 w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
