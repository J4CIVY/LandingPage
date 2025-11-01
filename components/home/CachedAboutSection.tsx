'use cache';

/**
 * Cached About Section Component
 * 
 * This component is marked with 'use cache' directive to enable
 * React 19's component-level caching. It will be cached across
 * requests and revalidated based on Next.js caching strategy.
 * 
 * Perfect for static content that doesn't change frequently.
 */

import React from "react";
import Image from "next/image";

export default async function CachedAboutSection() {
  // This component's output will be cached
  // No need to re-render on every request
  
  return (
    <section 
      id="about-section"
      data-section="about"
      className="py-20 px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-950"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            id="about-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            ¿Quiénes Somos?
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Somos más que un motoclub, somos una familia unida por la pasión de las dos ruedas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg"
              alt="BSK Motorcycle Team - Comunidad de motociclistas"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              BSK Motorcycle Team
            </h3>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Fundado en 2018, <strong>BSK Motorcycle Team</strong> nació del sueño de un grupo 
              de moteros apasionados que buscaban crear algo más que un simple club: 
              una verdadera hermandad sobre ruedas.
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Con sede en <strong>Bogotá, Colombia</strong>, hemos crecido hasta convertirnos 
              en uno de los motoclubs más grandes y reconocidos del país, contando con 
              <strong> más de 500 miembros activos</strong> que comparten la pasión por las motos 
              y el espíritu de aventura.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-4xl font-bold text-red-600">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Miembros Activos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-4xl font-bold text-red-600">100+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Rutas Realizadas</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-4xl font-bold text-red-600">2018</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Año de Fundación</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-4xl font-bold text-red-600">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Soporte en Ruta</div>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Nuestros Valores
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">🏍️</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Hermandad:</strong> Unidos como familia, apoyándonos en cada viaje
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">🛡️</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Seguridad:</strong> Prioridad en cada ruta y evento
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">🤝</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Respeto:</strong> Hacia todos los motociclistas y la comunidad
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">⚡</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Pasión:</strong> Por las motos y la aventura en carretera
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
