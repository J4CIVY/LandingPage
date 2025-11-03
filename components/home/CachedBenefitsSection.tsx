'use cache';

/**
 * Cached Benefits Section Component
 * 
 * Uses React 19's 'use cache' directive for component-level caching.
 * Benefits data is fetched using cached functions and the component
 * output is cached across requests.
 */

import { type ReactNode } from "react";
import { getCachedBenefits } from "@/lib/cache-utils";
import { FaMotorcycle, FaTools, FaCalendarAlt, FaUsers, FaShieldAlt, FaMapMarkedAlt } from "react-icons/fa";

// Icon mapping for benefits
const iconMap: Record<string, ReactNode> = {
  motorcycle: <FaMotorcycle className="text-4xl text-red-600" />,
  tools: <FaTools className="text-4xl text-red-600" />,
  calendar: <FaCalendarAlt className="text-4xl text-red-600" />,
  users: <FaUsers className="text-4xl text-red-600" />,
  shield: <FaShieldAlt className="text-4xl text-red-600" />,
  map: <FaMapMarkedAlt className="text-4xl text-red-600" />,
};

// Default benefits if API fails
const defaultBenefits = [
  {
    id: '1',
    title: 'Eventos Semanales',
    description: 'Rodadas, talleres y actividades cada semana para disfrutar de tu pasión',
    icon: 'calendar'
  },
  {
    id: '2',
    title: 'Asistencia 24/7',
    description: 'Soporte mecánico y en carretera disponible las 24 horas del día',
    icon: 'shield'
  },
  {
    id: '3',
    title: 'Rutas Épicas',
    description: 'Explora Colombia con más de 100 rutas diseñadas para todos los niveles',
    icon: 'map'
  },
  {
    id: '4',
    title: 'Talleres Especializados',
    description: 'Aprende mecánica, conducción segura y primeros auxilios',
    icon: 'tools'
  },
  {
    id: '5',
    title: 'Comunidad Activa',
    description: 'Más de 500 moteros que comparten tu misma pasión',
    icon: 'users'
  },
  {
    id: '6',
    title: 'Descuentos Exclusivos',
    description: 'Acceso a beneficios en tiendas, talleres y accesorios para tu moto',
    icon: 'motorcycle'
  },
];

export default async function CachedBenefitsSection() {
  // Fetch benefits using cached function
  // This will be cached at the request level
  let benefits = await getCachedBenefits();
  
  // Fallback to default benefits if fetch fails
  if (!benefits || benefits.length === 0) {
    benefits = defaultBenefits;
  }

  return (
    <section 
      id="benefits-section"
      className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900"
      aria-labelledby="benefits-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            id="benefits-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Beneficios de Unirte
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Descubre todo lo que BSK Motorcycle Team tiene para ofrecerte
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <div
              key={benefit.id || benefit._id}
              className="bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  {iconMap[benefit.icon] || <FaMotorcycle className="text-4xl text-red-600" />}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Optional: Category badge */}
                {benefit.category && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-full">
                    {benefit.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <a
            href="/memberships"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Conoce Nuestras Membresías
          </a>
        </div>
      </div>
    </section>
  );
}
