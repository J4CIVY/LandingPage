import { type FC } from 'react';
import { FaMotorcycle, FaShieldAlt, FaUsers, FaMedal, FaHandsHelping } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import Link from 'next/link';

/**
 * ✅ SEO OPTIMIZATION: Removed 'use client' directive
 * This page is now a Server Component for better SEO and performance
 * The page contains only static content, so client-side rendering is not needed
 * Benefits: Faster initial load, better search engine crawling, server-side rendering
 */

/**
 * MembershipInfoPage component provides detailed information about the "Friend" membership.
 * It outlines benefits, duties, and obligations, and includes links for navigation.
 * @returns {ReactElement}
 */
const MembershipInfoPage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <GiSteelwingEmblem className="text-red-600 dark:text-red-400 text-5xl" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Membresía Friend - BSK Motorcycle Team
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-300">
            Todo sobre la membresía básica del mejor motoclub de Colombia. Descubre beneficios exclusivos, responsabilidades y cómo formar parte de nuestra comunidad motera.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">¿Qué es la Membresía Friend de BSK MT?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            La Membresía Friend es tu puerta de entrada al mundo del motociclismo organizado con el club de motos líder en Colombia. Es el nivel básico de membresía diseñado para moteros que quieren ser parte de nuestra hermandad, disfrutar de beneficios exclusivos, participar en rutas épicas y crecer personal y profesionalmente con nosotros.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Como miembro Friend de BSK Motorcycle Team, te unes a una comunidad de más de 500 motociclistas activos en Bogotá y toda Colombia que comparten tu pasión por las dos ruedas, la aventura y el respeto por la vida en carretera.
          </p>
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 dark:border-red-400 p-4 mb-6" role="alert">
            <p className="text-red-800 dark:text-red-200 font-medium">
              "Ser miembro de BSK Motorcycle Team no es solo tener un carnet, es adoptar un estilo de vida motero con valores sólidos, comunidad auténtica y pasión genuina por las dos ruedas."
            </p>
          </div>
        </div>

        {/* Membership Comparison Table */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Comparación de Membresías BSK MT</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-slate-950 dark:bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Beneficio</th>
                  <th className="px-6 py-4 text-center bg-green-600 dark:bg-green-700">Friend</th>
                  <th className="px-6 py-4 text-center">Pro</th>
                  <th className="px-6 py-4 text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Acceso a rodadas semanales</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Descuentos en eventos</td>
                  <td className="px-6 py-4 text-center">10%</td>
                  <td className="px-6 py-4 text-center">20%</td>
                  <td className="px-6 py-4 text-center">30%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Descuentos en merchandising</td>
                  <td className="px-6 py-4 text-center">25%</td>
                  <td className="px-6 py-4 text-center">50%</td>
                  <td className="px-6 py-4 text-center">75%</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Asistencia en carretera</td>
                  <td className="px-6 py-4 text-center">Básica</td>
                  <td className="px-6 py-4 text-center">Premium</td>
                  <td className="px-6 py-4 text-center">VIP 24/7</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Acceso a tours especiales</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅ Prioritario</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Capacitaciones gratis anuales</td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center">3</td>
                  <td className="px-6 py-4 text-center">Ilimitadas</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            * Puedes ascender de nivel acumulando puntos por participación en eventos y actividades del club.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Beneficios de ser Friend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <FaMotorcycle className="text-red-600 dark:text-red-400 text-2xl mr-3" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Eventos Exclusivos</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Acceso a rodadas, encuentros y eventos organizados exclusivamente para miembros BSK.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <FaShieldAlt className="text-red-600 dark:text-red-400 text-2xl mr-3" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Descuentos en Aliados</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Beneficios especiales y descuentos en talleres, repuestos y accesorios con nuestros aliados comerciales.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <FaUsers className="text-red-600 dark:text-red-400 text-2xl mr-3" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Comunidad Activa</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Forma parte de una red de moteros apasionados con quienes compartir experiencias y conocimientos.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <FaMedal className="text-red-600 dark:text-red-400 text-2xl mr-3" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Sistema de Puntos</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Acumula puntos por participación que puedes canjear por beneficios y ascensos en la membresía.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Deberes y Obligaciones</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Respeto a la comunidad:</span> Todo miembro debe mantener una conducta respetuosa con otros miembros y con la imagen del club.
              </p>
            </div>
            <div className="flex items-start">
              <div className="shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Seguridad vial:</span> Cumplir con las normas de tránsito y promover la conducción segura en todas las actividades.
              </p>
            </div>
            <div className="flex items-start">
              <div className="shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Pago oportuno:</span> Mantener al día los pagos de la membresía según la periodicidad establecida.
              </p>
            </div>
            <div className="flex items-start">
              <div className="shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Participación:</span> Se espera que los miembros participen activamente en al menos el 30% de las actividades anuales.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-300 p-4" role="alert">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Importante</h3>
          <p className="text-yellow-700 dark:text-yellow-100">
            Al registrarte como miembro Friend aceptas cumplir con nuestro código de conducta y reglamento interno. El incumplimiento de estas normas puede resultar en la suspensión o cancelación de tu membresía sin derecho a reembolso.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Preguntas Frecuentes sobre la Membresía Friend</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿Cuánto cuesta la Membresía Friend?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                La Membresía Friend tiene un costo accesible que varía según el período de suscripción. Contáctanos para conocer las opciones mensuales, trimestrales y anuales. Inversión desde $50,000 COP mensuales.
              </p>
            </details>

            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿Puedo cancelar mi membresía en cualquier momento?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Sí, puedes cancelar tu membresía en cualquier momento. Solo debes notificarnos con 30 días de anticipación. No hay penalizaciones por cancelación, aunque los pagos realizados no son reembolsables.
              </p>
            </details>

            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿Necesito tener una motocicleta específica para unirme?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                No. BSK Motorcycle Team acepta motociclistas con cualquier tipo de motocicleta: deportivas, naked, touring, adventure, cruiser, custom y más. Lo importante es tu pasión por el motociclismo y el respeto por las normas de tránsito.
              </p>
            </details>

            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿Cuántas rodadas debo asistir como mínimo?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Se espera una participación activa de al menos 30% de las actividades anuales (aproximadamente 1 evento cada 3 meses). Sin embargo, entendemos que cada miembro tiene compromisos personales, por lo que somos flexibles.
              </p>
            </details>

            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿Cómo puedo ascender a membresías superiores (Pro o Elite)?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Acumulas puntos por participación en eventos, rodadas, talleres, y contribuciones al club. Al alcanzar ciertos umbrales de puntos y cumplir requisitos adicionales, puedes ascender. También puedes hacer upgrade directo pagando la diferencia.
              </p>
            </details>

            <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                ¿La membresía incluye seguro de moto?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                La membresía NO incluye seguro de motocicleta. Sin embargo, como miembro tienes acceso a tarifas preferenciales con nuestras aseguradoras aliadas y descuentos en pólizas SOAT y todo riesgo.
              </p>
            </details>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
          <Link 
            href="/" className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 text-center"
            aria-label="Volver al inicio"
          >
            Volver al inicio
          </Link>
          
          <Link 
            href="/dashboard/membership" 
            className="w-full sm:w-auto px-6 py-3 border border-blue-600 dark:border-blue-400 text-base font-medium rounded-md text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-center"
            aria-label="Ver estado de mi membresía"
          >
            Mi Estado de Membresía
          </Link>
          
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 text-center"
            aria-label="Continuar con el registro"
          >
            Continuar con el registro
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <FaHandsHelping className="text-gray-400 dark:text-gray-300 mr-2" aria-hidden="true" />
            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
              ¿Tienes dudas? Contáctanos en <a href="mailto:membership@bskmt.com" className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">membership@bskmt.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipInfoPage;
