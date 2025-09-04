'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Si NO está autenticado, mostrar solo el icono de login
  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Iniciar sesión"
      >
        <FaUser className="w-5 h-5" />
      </Link>
    );
  }

  // Si está autenticado, mostrar avatar de usuario
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-colors"
        aria-label={`Menú de usuario - ${user.firstName} ${user.lastName}`}
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
        <svg
          className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''} hidden md:block`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
          {/* Información del usuario */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 capitalize mt-1">
              Membresía: {user.membershipType}
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTachometerAlt className="mr-3 w-4 h-4" />
              Panel de Control
            </Link>
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUser className="mr-3 w-4 h-4" />
              Mi Perfil
            </Link>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
