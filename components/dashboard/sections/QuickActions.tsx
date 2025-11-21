'use client';

import { type ReactNode } from 'react';
import { 
  FaHome,
  FaUser,
  FaUsers,
  FaCalendarAlt, 
  FaEnvelope, 
  FaGift, 
  FaShieldAlt, 
  FaCloudSun, 
  FaBookOpen,
  FaTrophy,
  FaAddressCard,
  FaStore,
  FaArrowRight,
  FaFileInvoiceDollar
} from 'react-icons/fa';

import {
  FaGear
} from "react-icons/fa6";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'home',
    title: 'Inicio',
    description: 'Regresa a la página principal',
    icon: <FaHome />,
    href: '/dashboard',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30'
  },
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Gestiona tu información personal',
    icon: <FaUser />,
    href: '/dashboard/profile',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
  },
  {
    id: 'membership',
    title: 'Gestión de Membresía',
    description: 'Gestiona tu membresía y beneficios',
    icon: <FaAddressCard />,
    href: '/dashboard/membership',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
  },
  {
    id: 'events',
    title: 'Ver Mis Eventos',
    description: 'Eventos registrados y favoritos',
    icon: <FaCalendarAlt />,
    href: '/dashboard/eventos',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
  },
  {
    id: 'comunity',
    title: 'Ver Mi Comunidad',
    description: 'Conéctate con otros miembros',
    icon: <FaUsers />,
    href: '/dashboard/comunidad',
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    hoverColor: 'hover:bg-lime-100 dark:hover:bg-lime-900/30'
  },
  {
    id: 'pqrsdf',
    title: 'Enviar PQRSDF',
    description: 'Peticiones, quejas y sugerencias',
    icon: <FaEnvelope />,
    href: '/dashboard/pqrsdf',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
  },
  {
    id: 'benefits',
    title: 'Beneficios',
    description: 'Descuentos y convenios',
    icon: <FaGift />,
    href: '/dashboard/beneficios',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
  },
  {
    id: 'store',
    title: 'Tienda',
    description: 'Accede a la tienda',
    icon: <FaStore />,
    href: '/dashboard/store',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900/30'
  },
  {
    id: 'points',
    title: 'Sistema de Puntos',
    description: 'Canjea puntos por recompensas',
    icon: <FaTrophy />,
    href: '/dashboard/puntos',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    hoverColor: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
  },
  {
    id: 'billing',
    title: 'Facturación y Pagos',
    description: 'Historial de pagos y facturas',
    icon: <FaFileInvoiceDollar />,
    href: '/dashboard/billing',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
  },

  {
    id: 'sos',
    title: 'Emergencia SOS',
    description: 'Solicitar ayuda inmediata',
    icon: <FaShieldAlt />,
    href: '/sos',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    hoverColor: 'hover:bg-sky-100 dark:hover:bg-sky-900/30'
  },
  {
    id: 'weather',
    title: 'Estado del Clima',
    description: 'Consulta el clima para rodadas',
    icon: <FaCloudSun />,
    href: '/weather',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
  },
  {
    id: 'courses',
    title: 'Cursos Disponibles',
    description: 'Capacitación y entrenamiento',
    icon: <FaBookOpen />,
    href: '/courses',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
  },
  {
    id: 'security',
    title: 'Estado de Seguridad',
    description: 'Consulta el estado de seguridad',
    icon: <FaGear />,
    href: '/dashboard/security',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    hoverColor: 'hover:bg-violet-100 dark:hover:bg-violet-900/30'
  }
];

export default function QuickActions() {
  const handleActionClick = (action: QuickAction) => {
    if (action.id === 'sos') {
      // Para SOS, podríamos mostrar un modal de confirmación
      const confirmed = window.confirm('¿Estás seguro de que necesitas ayuda de emergencia?');
      if (confirmed) {
        window.location.href = action.href;
      }
    } else {
      window.location.href = action.href;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaArrowRight className="mr-2 text-slate-600 dark:text-slate-400" />
          Atajos Rápidos
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                p-4 rounded-lg border-2 border-transparent text-left
                ${action.bgColor} ${action.hoverColor}
                hover:border-current hover:shadow-md hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
              `}
            >
              <div className={`text-2xl mb-3 ${action.color}`}>
                {action.icon}
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${action.color}`}>
                {action.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
