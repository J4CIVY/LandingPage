import { FaCalendarAlt, FaWrench, FaStore, FaGift, FaExternalLinkAlt, FaCheck, FaTimes } from 'react-icons/fa';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  category: string;
}

interface MembershipBenefitsProps {
  benefits: Benefit[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaCalendarAlt,
  FaWrench,
  FaStore,
  FaGift
};

const categoryColors: Record<string, string> = {
  events: 'bg-blue-100 text-blue-800',
  support: 'bg-green-100 text-green-800',
  commercial: 'bg-purple-100 text-purple-800',
  social: 'bg-yellow-100 text-yellow-800'
};

const categoryNames: Record<string, string> = {
  events: 'Eventos',
  support: 'Soporte',
  commercial: 'Comercial',
  social: 'Social'
};

export default function MembershipBenefits({ benefits }: MembershipBenefitsProps) {
  const activeBenefits = benefits.filter(benefit => benefit.isActive);
  const inactiveBenefits = benefits.filter(benefit => !benefit.isActive);

  const renderBenefit = (benefit: Benefit, isActive: boolean = true) => {
    const IconComponent = iconMap[benefit.icon] || FaGift;
    const categoryColor = categoryColors[benefit.category] || 'bg-gray-100 text-gray-800';
    const categoryName = categoryNames[benefit.category] || benefit.category;

    return (
      <div 
        key={benefit.id}
        className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
          isActive 
            ? 'bg-white border-gray-200 hover:border-green-300' 
            : 'bg-gray-50 border-gray-200 opacity-75'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
            <IconComponent className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {benefit.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                  {categoryName}
                </span>
                {isActive ? (
                  <FaCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FaTimes className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <p className={`text-sm mb-4 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
              {benefit.description}
            </p>

            {isActive && (
              <button className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200">
                Ver beneficio
                <FaExternalLinkAlt className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Beneficios de tu Membresía</h2>
        <span className="text-sm text-gray-500">
          {activeBenefits.length} beneficios activos
        </span>
      </div>

      {/* Beneficios activos */}
      {activeBenefits.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheck className="w-5 h-5 text-green-500" />
            Beneficios Activos
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBenefits.map(benefit => renderBenefit(benefit, true))}
          </div>
        </div>
      )}

      {/* Beneficios no disponibles */}
      {inactiveBenefits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <FaTimes className="w-5 h-5 text-gray-400" />
            No Disponibles en tu Plan
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inactiveBenefits.map(benefit => renderBenefit(benefit, false))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Quieres acceder a más beneficios?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Upgrading tu membresía para desbloquear beneficios adicionales y obtener más valor.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200">
              Ver Planes Superiores
            </button>
          </div>
        </div>
      )}

      {/* Estado sin beneficios */}
      {benefits.length === 0 && (
        <div className="text-center py-12">
          <FaGift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay beneficios disponibles
          </h3>
          <p className="text-gray-500 mb-4">
            Los beneficios se cargarán una vez que se active tu membresía.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
            Activar Membresía
          </button>
        </div>
      )}
    </div>
  );
}