import React from "react";
import {
  FaUsers,
  FaTools,
  FaMoneyBillWave,
  FaGlassCheers,
  FaGraduationCap,
  FaShieldAlt
} from 'react-icons/fa';
import Testimonials from "./Testimonials";

const BenefitsSection: React.FC = () => (
  <section className="py-20 px-4 bg-white dark:bg-slate-950">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
        BENEFICIOS DE <span className="text-green-400">SER MIEMBRO</span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Beneficios Sociales */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
              <FaUsers className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Comunidad</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Pertenencia a comunidad con intereses comunes</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Red de apoyo entre motociclistas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Amistades duraderas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Reuniones y encuentros regulares</span>
            </li>
          </ul>
        </div>

        {/* Beneficios Técnicos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-700 text-white p-3 rounded-full mr-4">
              <FaTools className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Asistencia Técnica</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Asistencia mecánica básica entre miembros</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Descuentos en servicios mecánicos</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Acceso a conocimientos técnicos compartidos</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Talleres de mantenimiento y seguridad</span>
            </li>
          </ul>
        </div>

        {/* Beneficios Económicos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-700 text-white p-3 rounded-full mr-4">
              <FaMoneyBillWave className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Ventajas Económicas</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Descuentos en ropa y accesorios</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Convenios con aseguradoras</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Beneficios en combustible</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Compra colectiva con precios reducidos</span>
            </li>
          </ul>
        </div>

        {/* Beneficios Recreativos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-700 text-white p-3 rounded-full mr-4">
              <FaGlassCheers className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Actividades Recreativas</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Rutas y viajes grupales</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Acceso preferencial a eventos</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Celebraciones exclusivas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Sorteos y rifas internas</span>
            </li>
          </ul>
        </div>

        {/* Beneficios Formativos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-700 text-white p-3 rounded-full mr-4">
              <FaGraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Formación</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Charlas sobre seguridad vial</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Conducción defensiva</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Capacitación para diferentes terrenos</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Charlas de liderazgo y crecimiento</span>
            </li>
          </ul>
        </div>

        {/* Beneficios de Seguridad */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-700 text-white p-3 rounded-full mr-4">
              <FaShieldAlt className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Seguridad</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Apoyo en carretera en emergencias</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Sistemas de localización en salidas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Protocolos de seguridad para salidas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Red de apoyo en viajes largos</span>
            </li>
          </ul>
        </div>
      </div>

      <Testimonials />
    </div>
  </section>
);

export default BenefitsSection;


