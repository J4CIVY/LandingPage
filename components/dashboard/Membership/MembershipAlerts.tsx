import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface MembershipAlertsProps {
  membershipData: MembershipData;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  actionText?: string;
  actionHandler?: () => void;
  dismissible?: boolean;
}

export default function MembershipAlerts({ membershipData }: MembershipAlertsProps) {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Alerta de vencimiento
    if (membershipData.status === 'expired') {
      alerts.push({
        id: 'expired',
        type: 'error',
        title: 'Membresía Vencida',
        message: 'Tu membresía ha vencido. Renueva ahora para mantener acceso a todos los beneficios del motoclub.',
        actionText: 'Renovar Ahora',
        dismissible: false
      });
    } else if (membershipData.daysRemaining <= 7) {
      alerts.push({
        id: 'expiring-soon',
        type: 'warning',
        title: 'Membresía por Vencer',
        message: `Tu membresía vence en ${membershipData.daysRemaining} día${membershipData.daysRemaining !== 1 ? 's' : ''}. Renueva pronto para evitar la interrupción de servicios.`,
        actionText: 'Renovar',
        dismissible: true
      });
    } else if (membershipData.daysRemaining <= 30) {
      alerts.push({
        id: 'expiring-month',
        type: 'info',
        title: 'Recordatorio de Renovación',
        message: `Tu membresía vence en ${membershipData.daysRemaining} días. Considera activar la renovación automática.`,
        actionText: 'Configurar Auto-renovación',
        dismissible: true
      });
    }

    // Alerta de auto-renovación
    if (!membershipData.autoRenewal && membershipData.status === 'active') {
      alerts.push({
        id: 'auto-renewal',
        type: 'info',
        title: 'Renovación Automática Desactivada',
        message: 'Activa la renovación automática para no perder el acceso a tus beneficios.',
        actionText: 'Activar',
        dismissible: true
      });
    }

    // Alertas promocionales (simuladas)
    if (membershipData.type === 'friend' && Math.random() > 0.7) {
      alerts.push({
        id: 'upgrade-promo',
        type: 'success',
        title: '¡Oferta Especial!',
        message: 'Upgrade a Rider con 20% de descuento. Válido hasta fin de mes.',
        actionText: 'Ver Oferta',
        dismissible: true
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500 dark:text-red-400',
          buttonColor: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800',
          icon: FaExclamationTriangle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-500 dark:text-yellow-400',
          buttonColor: 'bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-800',
          icon: FaExclamationTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500 dark:text-blue-400',
          buttonColor: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800',
          icon: FaInfoCircle
        };
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500 dark:text-green-400',
          buttonColor: 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800',
          icon: FaCheckCircle
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-slate-900',
          borderColor: 'border-gray-200 dark:border-slate-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          iconColor: 'text-gray-500 dark:text-gray-400',
          buttonColor: 'bg-gray-600 dark:bg-slate-700 hover:bg-gray-700 dark:hover:bg-slate-800',
          icon: FaInfoCircle
        };
    }
  };

  const handleDismiss = (alertId: string) => {
    // Aquí implementar la lógica para ocultar la alerta
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const config = getAlertConfig(alert.type);
        const AlertIcon = config.icon;

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
          >
            <div className="flex items-start gap-3">
              <AlertIcon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
              
              <div className="flex-1">
                <h3 className={`font-semibold ${config.textColor} mb-1`}>
                  {alert.title}
                </h3>
                <p className={`text-sm ${config.textColor} mb-3`}>
                  {alert.message}
                </p>
                
                {alert.actionText && alert.actionHandler && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={alert.actionHandler}
                      className={`${config.buttonColor} text-white font-medium py-2 px-4 rounded-lg text-sm`}
                    >
                      {alert.actionText}
                    </button>
                  </div>
                )}
              </div>

              {alert.dismissible && (
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={`p-1 rounded-md ${config.textColor} hover:bg-black/10 dark:hover:bg-white/10`}
                  aria-label="Cerrar alerta"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}