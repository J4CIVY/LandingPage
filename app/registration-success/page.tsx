'use client';

import React from 'react';
import { GiSteelwingEmblem } from 'react-icons/gi';
import { FaCheckCircle } from 'react-icons/fa'; 
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * RegistrationSuccess component displays a success message after user registration.
 * It includes next steps and contact information.
 * @returns {JSX.Element}
 */
const ContentWithSearchParams: React.FC = () => {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('userEmail');

  return (
  <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-8 text-center">
      <div className="flex justify-center mb-6">
        <GiSteelwingEmblem className="text-red-600 dark:text-red-400 text-5xl" aria-hidden="true" />
      </div>

      <div className="flex justify-center mb-6">
        <FaCheckCircle className="text-green-500 dark:text-green-400 text-6xl" aria-hidden="true" />
      </div>

  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">¡Registro Completado!</h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Tu cuenta en <span className="text-red-600 dark:text-red-400 font-bold">BSK Motorcycle Team</span> ha sido creada exitosamente.
      </p>

      <div className="mt-6 bg-amber-50 dark:bg-yellow-900/30 p-6 rounded-lg border border-amber-200 dark:border-yellow-300" role="alert">
        <h3 className="text-xl font-semibold text-amber-800 dark:text-yellow-200 mb-3">📧 Verificación de correo requerida</h3>
        <p className="text-amber-700 dark:text-yellow-100 mb-4">
          <strong>Importante:</strong> Tu cuenta está pendiente de verificación. Debes verificar tu correo electrónico antes de poder iniciar sesión.
        </p>
        <p className="text-amber-700 dark:text-yellow-100 mb-4">
          Hemos enviado un correo de verificación a <span className="font-semibold bg-amber-100 dark:bg-yellow-800/40 px-2 py-1 rounded">{userEmail || 'tu dirección de correo'}</span>.
        </p>
        <div className="bg-amber-100 dark:bg-yellow-800/40 p-3 rounded border-l-4 border-amber-400 dark:border-yellow-300">
          <p className="text-amber-800 dark:text-yellow-200 text-sm font-medium">
            ⚠️ No podrás iniciar sesión hasta que verifiques tu correo electrónico.
          </p>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-400">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">� Instrucciones:</h3>
        <ol className="text-blue-700 dark:text-blue-100 text-sm space-y-2 list-decimal list-inside">
          <li>Revisa tu bandeja de entrada y la carpeta de spam</li>
          <li>Busca el correo de "BSK Motorcycle Team - Verifica tu correo"</li>
          <li>Haz clic en el enlace de verificación</li>
          <li>Serás redirigido a la página de bienvenida del club</li>
          <li>¡Después podrás iniciar sesión normalmente!</li>
        </ol>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8 text-left mt-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Proceso de activación:
        </h2>

        <div className="space-y-4">
          {[
            {
              title: '✅ Cuenta creada exitosamente',
              text: 'Tu información ha sido registrada en nuestro sistema.'
            },
            {
              title: '📧 Email de verificación enviado',
              text: 'Revisa tu correo y haz clic en el enlace de verificación.'
            },
            {
              title: '🎉 Bienvenida al club',
              text: 'Después de verificar tu email serás oficialmente parte del BSK MT.'
            },
            {
              title: '🚀 Acceso completo',
              text: 'Podrás iniciar sesión y acceder a todas las funcionalidades.'
            }
          ].map((step, index) => (
            <div className="flex items-start" key={index}>
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{step.title}:</span> {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/verify-email"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Ir a verificación de email"
        >
          Verificar Email
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
          aria-label="Volver al Inicio"
        >
          Volver al Inicio
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 border border-red-600 dark:border-red-400 text-base font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
          aria-label="Iniciar Sesión"
        >
          Iniciar Sesión
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          ¿Tienes preguntas? Contáctanos en <a href="mailto:soporte@bskmt.com" className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">soporte@bskmt.com</a>
        </p>
      </div>
    </div>
  );
};

const RegistrationSuccess: React.FC = () => {
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-gray-500">Cargando...</div>}>
        <ContentWithSearchParams />
      </Suspense>
    </div>
  );
};

export default RegistrationSuccess;