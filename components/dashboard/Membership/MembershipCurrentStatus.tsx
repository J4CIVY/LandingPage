import { FaCalendarAlt, FaCheck, FaExclamationTriangle, FaTimes, FaCog } from 'react-icons/fa';

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface MembershipCurrentStatusProps {
  membershipData: MembershipData;
}

const membershipTypeNames: Record<string, string> = {
  friend: 'Amigo',
  rider: 'Rider',
  'rider-duo': 'Rider Dúo',
  pro: 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

export default function MembershipCurrentStatus({ membershipData }: MembershipCurrentStatusProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const getStatusConfig = () => {
    switch (membershipData.status) {
      case 'active':
        return {
          icon: FaCheck,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900',
          borderColor: 'border-green-200 dark:border-green-800',
          progressColor: 'bg-green-600 dark:bg-green-400'
        };
      case 'expiring':
        return {
          icon: FaExclamationTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          progressColor: 'bg-yellow-600 dark:bg-yellow-400'
        };
      case 'expired':
        return {
          icon: FaTimes,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900',
          borderColor: 'border-red-200 dark:border-red-800',
          progressColor: 'bg-red-600 dark:bg-red-400'
        };
      default:
        return {
          icon: FaCheck,
          color: 'text-gray-600 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-slate-900',
          borderColor: 'border-gray-200 dark:border-slate-700',
          progressColor: 'bg-gray-600 dark:bg-gray-400'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const progressPercentage = Math.max(0, Math.min(100, (membershipData.daysRemaining / 365) * 100));

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Estado Actual de la Membresía</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información principal */}
        <div className="space-y-4">
          {/* Tipo de membresía */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
              Tipo de Membresía
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {membershipTypeNames[membershipData.type] || membershipData.type}
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                Fecha de Inicio
              </label>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaCalendarAlt className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span>{formatDate(membershipData.startDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                Fecha de Expiración
              </label>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaCalendarAlt className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span>{formatDate(membershipData.expirationDate)}</span>
              </div>
            </div>
          </div>

          {/* Auto renovación */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
              Renovación Automática
            </label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                membershipData.autoRenewal 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300'
              }`}>
                {membershipData.autoRenewal ? (
                  <>
                    <FaCheck className="w-3 h-3 mr-1" />
                    Activada
                  </>
                ) : (
                  <>
                    <FaTimes className="w-3 h-3 mr-1" />
                    Desactivada
                  </>
                )}
              </span>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                <FaCog className="w-3 h-3" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Estado visual y progreso */}
        <div className={`p-6 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
          <div className="text-center mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusConfig.bgColor} border-2 ${statusConfig.borderColor} mb-3`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <h3 className={`text-lg font-bold ${statusConfig.color}`}>
              {membershipData.status === 'active' && 'Membresía Activa'}
              {membershipData.status === 'expiring' && 'Por Vencer'}
              {membershipData.status === 'expired' && 'Membresía Vencida'}
            </h3>
          </div>

          {/* Contador de días */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {membershipData.daysRemaining > 0 ? membershipData.daysRemaining : 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {membershipData.daysRemaining > 0 ? 'días restantes' : 'días vencido'}
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>Progreso</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${statusConfig.progressColor}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-2">
            <button className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg">
              Renovar Ahora
            </button>
            <button className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg">
              Actualizar Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}