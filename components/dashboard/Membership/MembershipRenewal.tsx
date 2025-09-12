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
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: 'Tu membresía ha vencido. Renueva ahora para mantener tus beneficios.',
        icon: FaExclamationTriangle
      };
    } else if (membershipData.daysRemaining <= 30) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        message: `Tu membresía vence en ${membershipData.daysRemaining} días. ¡Renueva pronto!`,
        icon: FaExclamationTriangle
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaSync className="w-5 h-5 text-green-600" />
          Renovar Plan Actual
        </h3>

        {currentPlan && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{currentPlan.name}</h4>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(currentPlan.price)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Duración: {currentPlan.duration}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FaCheckCircle className="w-3 h-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <FaCreditCard className="w-4 h-4" />
            Renovar Ahora - {currentPlan && formatCurrency(currentPlan.price)}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input 
              type="checkbox" 
              id="autoRenewal" 
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              defaultChecked={membershipData.autoRenewal}
            />
            <label htmlFor="autoRenewal">Activar renovación automática</label>
          </div>
        </div>
      </div>

      {/* Upgrade de plan */}
      {higherPlans.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaArrowUp className="w-5 h-5 text-purple-600" />
            Upgrade tu Plan
          </h3>

          <div className="space-y-4">
            {higherPlans.slice(0, 2).map((plan) => (
              <div key={plan.type} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Duración: {plan.duration}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {plan.features.length} beneficios incluidos
                  </span>
                  <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-1 px-3 rounded text-sm transition-colors duration-200">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Comparar Todos los Planes
          </button>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaCog className="w-5 h-5 text-gray-600" />
          Configuración
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Renovación automática</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                defaultChecked={membershipData.autoRenewal}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Gestionar Métodos de Pago
          </button>

          <button className="w-full text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Cancelar Membresía
          </button>
        </div>
      </div>
    </div>
  );
}