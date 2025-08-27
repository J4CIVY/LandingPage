import React from "react";
import {
  FaUsers,
  FaTools,
  FaMoneyBillWave,
  FaGlassCheers,
  FaGraduationCap,
  FaShieldAlt
} from 'react-icons/fa';
import { AnimatedHeading, AnimatedParagraph, AnimatedText } from "@/components/animations/AnimatedText";
import Testimonials from "./Testimonials";

const BenefitsSection: React.FC = () => (
  <section className="py-20 px-4 bg-white dark:bg-slate-950">
    <div className="max-w-6xl mx-auto">
      <AnimatedHeading 
        level={2}
        animationType="slideUp"
        delay={100}
        className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-4"
      >
        BENEFICIOS DE <span className="text-green-400">SER MIEMBRO</span>
      </AnimatedHeading>
      <AnimatedParagraph 
        animationType="fadeIn"
        delay={300}
        className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
      >
        Más que beneficios, es el respaldo de una comunidad que te acompaña en cada kilómetro
      </AnimatedParagraph>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Beneficios Sociales */}
        <AnimatedText
          animationType="slideUp"
          delay={400}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
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
        </AnimatedText>

        {/* Beneficios Técnicos */}
        <AnimatedText
          animationType="slideUp"
          delay={550}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
              <FaTools className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Asistencia Técnica</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Ayuda inmediata en carretera entre miembros</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Hasta 30% de descuento en talleres afiliados</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Conocimiento compartido de mecánica básica</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Talleres gratuitos de mantenimiento</span>
            </li>
          </ul>
        </AnimatedText>

        {/* Beneficios Económicos */}
        <AnimatedText
          animationType="slideUp"
          delay={700}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
              <FaMoneyBillWave className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Ahorros Reales</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Hasta 75% descuento en merchandising oficial</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Tarifas preferenciales en seguros</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Descuentos en estaciones de servicio</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Compras grupales con precios especiales</span>
            </li>
          </ul>
        </AnimatedText>

        {/* Beneficios Recreativos */}
        <AnimatedText
          animationType="slideUp"
          delay={850}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
              <FaGlassCheers className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Aventuras Inolvidables</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Rutas por toda Colombia con otros miembros</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Acceso prioritario a tours especiales</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Eventos exclusivos para miembros</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Sorteos mensuales de productos</span>
            </li>
          </ul>
        </AnimatedText>

        {/* Beneficios Formativos */}
        <AnimatedText
          animationType="slideUp"
          delay={1000}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
              <FaGraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Formación Especializada</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Curso de manejo defensivo certificado</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
              <span>Técnicas de conducción avanzada</span>
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
        </AnimatedText>

        {/* Beneficios de Seguridad */}
        <AnimatedText
          animationType="slideUp"
          delay={1150}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-slate-950 dark:bg-slate-800 text-white p-3 rounded-full mr-4">
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
        </AnimatedText>
      </div>

      <Testimonials />
    </div>
  </section>
);

export default BenefitsSection;



