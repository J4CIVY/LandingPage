import { FaSync, FaArrowUp, FaCog, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface MembershipData {
  type: string;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  autoRenewal: boolean;
}

interface MembershipRenewalProps {
  membershipData: MembershipData;
}

const membershipPlans = [
  {
    type: 'friend',
    name: 'Amigo',
    price: 50000,
    duration: '1 año',
    features: ['Acceso a eventos sociales', 'Newsletter mensual', 'Soporte básico']
  },
  {
    type: 'rider',
    name: 'Rider',
    price: 120000,
    duration: '1 año',
    features: ['Todo lo de Amigo', 'Descuentos en eventos', 'Soporte técnico', 'Convenios comerciales']
  },
  {
    type: 'rider-duo',
    name: 'Rider Dúo',
    price: 180000,
    duration: '1 año',
    features: ['Todo lo de Rider', 'Para 2 personas', 'Descuentos adicionales']
  },
  {
    type: 'pro',
    name: 'Profesional',
    price: 250000,
    duration: '1 año',
    features: ['Todo lo de Rider', 'Eventos exclusivos', 'Soporte prioritario', 'Seguro básico']
  },
  {
    type: 'pro-duo',
    name: 'Profesional Dúo',
    price: 380000,
    duration: '1 año',
    features: ['Todo lo de Profesional', 'Para 2 personas', 'Beneficios familiares']
  }
];

export default function MembershipRenewal({ membershipData }: MembershipRenewalProps) {
  const currentPlan = membershipPlans.find(plan => plan.type === membershipData.type);
  const higherPlans = membershipPlans.filter(plan => 
    membershipPlans.findIndex(p => p.type === plan.type) > 
    membershipPlans.findIndex(p => p.type === membershipData.type)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRenewalUrgency = () => {
    if (membershipData.daysRemaining <= 0) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900',
        borderColor: 'border-red-200 dark:border-red-800',
        message: 'Tu membresía ha vencido. Renueva ahora para mantener tus beneficios.',
        icon: FaExclamationTriangle
      };
    } else if (membershipData.daysRemaining <= 30) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        message: `Tu membresía vence en ${membershipData.daysRemaining} días. ¡Renueva pronto!`,
        icon: FaExclamationTriangle
      };
    } else {
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900',
        borderColor: 'border-green-200 dark:border-green-800',
        message: `Tu membresía está activa por ${membershipData.daysRemaining} días más.`,
        icon: FaCheckCircle
      };
    }
  };

  const urgency = getRenewalUrgency();
  const UrgencyIcon = urgency.icon;

  return (
  <div className="space-y-6">
      {/* Estado de renovación */}
  <div className={`p-4 rounded-lg border ${urgency.bgColor} ${urgency.borderColor}`}>
        <div className="flex items-start gap-3">
          <UrgencyIcon className={`w-5 h-5 mt-0.5 ${urgency.color}`} />
          <div>
            <h3 className={`font-semibold ${urgency.color} mb-1`}>
              Estado de Renovación
            </h3>
            <p className={`text-sm ${urgency.color}`}>
              {urgency.message}
            </p>
          </div>
        </div>
      </div>

      {/* Renovación actual */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaSync className="w-5 h-5 text-green-600 dark:text-green-400" />
          Renovar Plan Actual
        </h3>

        {currentPlan && (
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">{currentPlan.name}</h4>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(currentPlan.price)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Duración: {currentPlan.duration}
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FaCheckCircle className="w-3 h-3 text-green-500 dark:text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <button className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <FaCreditCard className="w-4 h-4" />
            Renovar Ahora - {currentPlan && formatCurrency(currentPlan.price)}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input 
              type="checkbox" 
              id="autoRenewal" 
              className="rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-400 focus:ring-green-500"
              defaultChecked={membershipData.autoRenewal}
            />
            <label htmlFor="autoRenewal">Activar renovación automática</label>
          </div>
        </div>
      </div>

      {/* Upgrade de plan */}
      {higherPlans.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaArrowUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Upgrade tu Plan
          </h3>

          <div className="space-y-4">
            {higherPlans.slice(0, 2).map((plan) => (
              <div key={plan.type} className="border border-gray-200 dark:border-purple-900 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Duración: {plan.duration}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.features.length} beneficios incluidos
                  </span>
                  <button className="bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 font-medium py-1 px-3 rounded text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium py-2 px-4 rounded-lg">
            Comparar Todos los Planes
          </button>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaCog className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          Configuración
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-200">Renovación automática</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                defaultChecked={membershipData.autoRenewal}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-green-600 dark:peer-checked:bg-green-700"></div>
            </label>
          </div>

          <button className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg">
            Gestionar Métodos de Pago
          </button>

          <button className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 font-medium py-2 px-4 rounded-lg">
            Cancelar Membresía
          </button>
        </div>
      </div>
    </div>
  );
}