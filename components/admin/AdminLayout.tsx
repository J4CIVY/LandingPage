'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { FaSpinner, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
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
              className="block w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header opcional */}
        {(title || description) && (
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </header>
        )}
        
        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
