'use client';

import React from 'react';

/**
 * CookiePolicy component displays the detailed cookie policy of BSK Motorcycle Team.
 * @returns {JSX.Element}
 */
const CookiePolicy: React.FC = () => {
  return (
  <div className="max-w-4xl mx-auto p-6 text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-950 rounded-xl shadow">
  <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-6">Política de Cookies - BSK Motorcycle Team</h1>
      
      <section className="mb-8">
  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">1. ¿Qué son las cookies?</h2>
        <p className="mb-4">
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet, smartphone) cuando visita nuestro sitio web. 
          Estas permiten que el sitio web recuerde sus acciones y preferencias (como inicio de sesión, idioma, tamaño de texto y otras preferencias de visualización) 
          durante un período de tiempo, para que no tenga que volver a introducirlas cuando regrese al sitio o navegue entre páginas.
        </p>
      </section>

      <section className="mb-8">
  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">2. Tipos de cookies que utilizamos</h2>
        
  <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">2.1 Cookies esenciales</h3>
        <p className="mb-4">
          <strong>Finalidad:</strong> Estas cookies son estrictamente necesarias para el funcionamiento básico del sitio web.
          <br />
          <strong>Ejemplos:</strong> Gestionar sesiones de usuario, prevenir fraudes, equilibrar la carga del servidor.
          <br />
          <strong>Duración:</strong> Sesión o persistentes (hasta 12 meses)
        </p>
        
  <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">2.2 Cookies de rendimiento</h3>
        <p className="mb-4">
          <strong>Finalidad:</strong> Mejorar el rendimiento y la experiencia del usuario.
          <br />
          <strong>Ejemplos:</strong> Analizar tráfico, tiempos de carga, rendimiento del sitio.
          <br />
          <strong>Duración:</strong> Hasta 24 meses
        </p>
        
  <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">2.3 Cookies funcionales</h3>
        <p className="mb-4">
          <strong>Finalidad:</strong> Recordar preferencias y proporcionar funcionalidades mejoradas.
          <br />
          <strong>Ejemplos:</strong> Configuraciones de idioma, región, tamaño de texto.
          <br />
          <strong>Duración:</strong> Hasta 12 meses
        </p>
        
  <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">2.4 Cookies de marketing</h3>
        <p className="mb-4">
          <strong>Finalidad:</strong> Mostrar publicidad relevante y medir la efectividad de campañas.
          <br />
          <strong>Ejemplos:</strong> Cookies de Facebook Pixel, Google Ads.
          <br />
          <strong>Duración:</strong> Hasta 12 meses
        </p>
        
  <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">2.5 Cookies de redes sociales</h3>
        <p className="mb-4">
          <strong>Finalidad:</strong> Permitir compartir contenido en redes sociales.
          <br />
          <strong>Ejemplos:</strong> Botones de compartir de Facebook, Twitter, Instagram.
          <br />
          <strong>Duración:</strong> Depende de cada red social (normalmente hasta 24 meses)
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">3. Listado detallado de cookies</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
            <thead>
              <tr>
                <th className="py-2 px-4 border text-left text-slate-950 dark:text-white">Nombre de la Cookie</th>
                <th className="py-2 px-4 border text-left text-slate-950 dark:text-white">Proveedor</th>
                <th className="py-2 px-4 border text-left text-slate-950 dark:text-white">Propósito</th>
                <th className="py-2 px-4 border text-left text-slate-950 dark:text-white">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">session_id</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">BSK Motorcycle Team</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Mantener la sesión del usuario</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Sesión</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-slate-800">
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">cookie_consent</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">BSK Motorcycle Team</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Recordar preferencias de cookies</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">12 meses</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">_ga</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Google Analytics</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Distinguir usuarios</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">24 meses</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-slate-800">
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">_gid</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Google Analytics</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">Distinguir usuarios</td>
                <td className="py-2 px-4 border text-gray-800 dark:text-gray-200">24 horas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">4. Gestión de cookies</h2>
        <p className="mb-4">
          Puede gestionar sus preferencias de cookies en cualquier momento accediendo al <a href="#configurar-cookies" className="text-green-400 dark:text-green-300">panel de configuración</a> 
          o mediante las opciones de su navegador:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2"><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-green-400 dark:text-green-300">Chrome</a></li>
          <li className="mb-2"><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-green-400 dark:text-green-300">Firefox</a></li>
          <li className="mb-2"><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-green-400 dark:text-green-300">Safari</a></li>
          <li className="mb-2"><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-green-400 dark:text-green-300">Edge</a></li>
        </ul>
      </section>

      <section className="mb-8">
  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">5. Cambios en la política de cookies</h2>
        <p>
          Podemos actualizar esta política periódicamente. Publicaremos cualquier cambio en esta página y, en caso de cambios significativos, 
          le notificaremos mediante un aviso destacado en nuestro sitio web.
        </p>
      </section>

      <section>
  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">6. Contacto</h2>
        <p>
          Para cualquier pregunta sobre nuestra política de cookies, contacte con nuestro Delegado de Protección de Datos en <a href="mailto:privacidad@bskmotorcycleteam.com" className="text-green-400 dark:text-green-300">privacidad@bskmotorcycleteam.com</a>.
        </p>
      </section>
    </div>
  );
};

export default CookiePolicy;
