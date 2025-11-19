'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeChanger from '@/components/shared/ThemeChanger';
import { 
  FaHome,
  FaUsers, 
  FaCalendarAlt,
  FaBoxes,
  FaIdCard,
  FaChartLine,
  FaCog,
  FaBell,
  FaEnvelope,
  FaMedkit,
  FaFileAlt,
  FaSignOutAlt,
  FaUserShield,
  FaTimes
} from 'react-icons/fa';

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
  };
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ user, onLogout, isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Dashboard Principal',
      href: '/admin',
      icon: FaHome,
      description: 'Vista general del sistema'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: FaUsers,
      description: 'Gestionar usuarios registrados'
    },
    {
      name: 'Eventos',
      href: '/admin/events',
      icon: FaCalendarAlt,
      description: 'Crear y administrar eventos'
    },
    {
      name: 'Productos',
      href: '/admin/products',
      icon: FaBoxes,
      description: 'Inventario y tienda'
    },
    {
      name: 'Membresías',
      href: '/admin/memberships',
      icon: FaIdCard,
      description: 'Solicitudes de membresía'
    },
    {
      name: 'Planes de Membresía',
      href: '/admin/membership-plans',
      icon: FaUserShield,
      description: 'Gestionar planes y beneficios'
    },
    {
      name: 'Emergencias',
      href: '/admin/emergencies',
      icon: FaMedkit,
      description: 'Panel de emergencias SOS'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: FaChartLine,
      description: 'Reportes y estadísticas'
    }
  ];

  const toolsItems = [
    {
      name: 'Mensajes',
      href: '/admin/messages',
      icon: FaEnvelope,
      description: 'Mensajes de contacto'
    },
    {
      name: 'Notificaciones',
      href: '/admin/notifications',
      icon: FaBell,
      description: 'Enviar notificaciones'
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: FaCog,
      description: 'Configuración del sistema'
    },
    {
      name: 'Logs',
      href: '/admin/logs',
      icon: FaFileAlt,
      description: 'Registro de actividades'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`
      fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      {/* Mobile close button */}
      {onClose && (
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Cerrar menú"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaUserShield className="text-xl lg:text-2xl text-blue-600 mr-3" />
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h2>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">BSK Motorcycle Team</p>
            </div>
          </div>
          <ThemeChanger />
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 shrink-0">
        <div className="flex items-center">
          <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-medium text-sm lg:text-base">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable area */}
      <nav className="flex-1 overflow-y-auto">
        {/* Gestión Principal */}
        <div className="px-4 lg:px-6 mt-6 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Gestión Principal
          </h3>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close mobile menu when clicking a link
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-4 w-4 lg:h-5 lg:w-5 shrink-0 ${
                    isActive(item.href)
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate lg:block hidden">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Herramientas */}
        <div className="px-4 lg:px-6 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Herramientas
          </h3>
          <div className="space-y-1">
            {toolsItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close mobile menu when clicking a link
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-4 w-4 lg:h-5 lg:w-5 shrink-0 ${
                    isActive(item.href)
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate lg:block hidden">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Spacer for footer */}
        <div className="h-20"></div>
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="absolute bottom-0 w-full p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <FaSignOutAlt className="mr-3 h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
          <span className="truncate">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
