'use client';

import { 
  FaUser, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaGift, 
  FaShieldAlt, 
  FaCloudSun, 
  FaBookOpen,
  FaArrowRight
} from 'react-icons/fa';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'profile',
    title: 'Actualizar Perfil',
    description: 'Edita tu información personal',
    icon: <FaUser />,
    href: '/dashboard/profile',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
  },
  {
    id: 'events',
    title: 'Ver Mis Eventos',
    description: 'Eventos registrados y favoritos',
    icon: <FaCalendarAlt />,
    href: '/events',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
  },
  {
    id: 'pqrsdf',
    title: 'Enviar PQRSDF',
    description: 'Peticiones, quejas y sugerencias',
    icon: <FaEnvelope />,
    href: '/contact',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
  },
  {
    id: 'benefits',
    title: 'Beneficios',
    description: 'Descuentos y convenios',
    icon: <FaGift />,
    href: '/benefits',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900/30'
  },
  {
    id: 'sos',
    title: 'Emergencia SOS',
    description: 'Solicitar ayuda inmediata',
    icon: <FaShieldAlt />,
    href: '/sos',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30'
  },
  {
    id: 'weather',
    title: 'Estado del Clima',
    description: 'Consulta el clima para rodadas',
    icon: <FaCloudSun />,
    href: '/weather',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
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
                p-4 rounded-lg border-2 border-transparent transition-all duration-200 text-left
                ${action.bgColor} ${action.hoverColor}
                hover:border-current hover:shadow-md transform hover:-translate-y-1
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