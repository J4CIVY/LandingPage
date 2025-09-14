'use client';

import { FaGift, FaEye, FaSpinner } from 'react-icons/fa';

interface Benefit {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'deal' | 'coupon';
  value?: string;
  isActive: boolean;
}

// Mock data - En producción esto vendría de la API
const mockBenefits: Benefit[] = [
  {
    id: '1',
    title: '20% Descuento en Repuestos',
    description: 'Descuento especial en repuestos para motos en tiendas afiliadas',
    type: 'discount',
    value: '20%',
    isActive: true
  },
  {
    id: '2',
    title: 'Mantenimiento Gratuito',
    description: 'Revisión básica gratuita mensual en talleres aliados',
    type: 'deal',
    isActive: true
  },
  {
    id: '3',
    title: 'Descuento en Gasolina',
    description: 'Cupón para descuento en estaciones de servicio',
    type: 'coupon',
    value: '10%',
    isActive: true
  },
  {
    id: '4',
    title: 'Seguro Preferencial',
    description: 'Tarifas preferenciales en seguros para motocicletas',
    type: 'discount',
    value: '15%',
    isActive: true
  }
];

export default function ActiveBenefits() {
  const benefits = mockBenefits.filter(benefit => benefit.isActive);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return '💰';
      case 'deal':
        return '🤝';
      case 'coupon':
        return '🎫';
      default:
        return '🎁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'deal':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'coupon':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const handleViewBenefit = (benefitId: string) => {
    // En producción, esto navegaría a la página de detalles del beneficio
    console.log(`Ver beneficio: ${benefitId}`);
    // window.location.href = `/benefits/${benefitId}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <FaGift className="mr-2 text-purple-600 dark:text-purple-400" />
          Beneficios Activos ({benefits.length})
        </h3>
      </div>
      
      <div className="p-6">
        {benefits.length === 0 ? (
          <div className="text-center py-8">
            <FaGift className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">No tienes beneficios activos</p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              Los beneficios aparecerán aquí según tu tipo de membresía
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getTypeColor(benefit.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getTypeIcon(benefit.type)}</span>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {benefit.title}
                      </h4>
                      {benefit.value && (
                        <span className="text-xs font-bold">
                          {benefit.value} OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs mb-4 opacity-90">
                  {benefit.description}
                </p>
                
                <button
                  onClick={() => handleViewBenefit(benefit.id)}
                  className="w-full inline-flex items-center justify-center px-3 py-1.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors border border-current/20"
                >
                  <FaEye className="mr-1" />
                  Ver beneficio
                </button>
              </div>
            ))}
          </div>
        )}
        
        {benefits.length > 0 && (
          <div className="text-center pt-6">
            <button
              onClick={() => console.log('Ver todos los beneficios')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Ver todos los beneficios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}