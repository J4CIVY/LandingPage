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
        actionHandler: () => console.log('Renovar membresía'),
        dismissible: false
      });
    } else if (membershipData.daysRemaining <= 7) {
      alerts.push({
        id: 'expiring-soon',
        type: 'warning',
        title: 'Membresía por Vencer',
        message: `Tu membresía vence en ${membershipData.daysRemaining} día${membershipData.daysRemaining !== 1 ? 's' : ''}. Renueva pronto para evitar la interrupción de servicios.`,
        actionText: 'Renovar',
        actionHandler: () => console.log('Renovar membresía'),
        dismissible: true
      });
    } else if (membershipData.daysRemaining <= 30) {
      alerts.push({
        id: 'expiring-month',
        type: 'info',
        title: 'Recordatorio de Renovación',
        message: `Tu membresía vence en ${membershipData.daysRemaining} días. Considera activar la renovación automática.`,
        actionText: 'Configurar Auto-renovación',
        actionHandler: () => console.log('Configurar auto-renovación'),
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
        actionHandler: () => console.log('Activar auto-renovación'),
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
        actionHandler: () => console.log('Ver oferta de upgrade'),
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
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: FaExclamationTriangle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: FaExclamationTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: FaInfoCircle
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: FaCheckCircle
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          icon: FaInfoCircle
        };
    }
  };

  const handleDismiss = (alertId: string) => {
    // Aquí implementar la lógica para ocultar la alerta
    console.log('Dismissing alert:', alertId);
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
                      className={`${config.buttonColor} text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200`}
                    >
                      {alert.actionText}
                    </button>
                  </div>
                )}
              </div>

              {alert.dismissible && (
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={`p-1 rounded-md ${config.textColor} hover:bg-black hover:bg-opacity-10 transition-colors duration-200`}
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