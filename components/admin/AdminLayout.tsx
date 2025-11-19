'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import AdminSidebar from '@/lib/components/admin/AdminSidebar';
import { FaSpinner, FaShieldAlt, FaBars } from 'react-icons/fa';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg max-w-md">
          <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <div className="space-y-3">
            <Link 
              href="/dashboard" 
              className="block w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Dashboard
            </Link>
            <Link 
              href="/" 
              className="block w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-16"> {/* pt-16 para dar espacio al header */}
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        user={user as any} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Mobile header with hamburger menu */}
        <div className="lg:hidden bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed top-16 left-0 right-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Abrir menú"
            >
              <FaBars className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Panel Admin
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Header opcional */}
        {(title || description) && (
          <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-gray-800 mt-0 lg:mt-0">
            <div className="px-4 lg:px-6 py-4">
              {title && (
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
          </header>
        )}
        
        {/* Content */}
        <main className="p-4 lg:p-6 mt-16 lg:mt-0"> {/* mt-16 en móvil para el header de admin */}
          {children}
        </main>
      </div>
    </div>
  );
}
