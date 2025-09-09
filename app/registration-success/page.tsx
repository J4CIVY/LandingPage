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
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
      <div className="flex justify-center mb-6">
        <GiSteelwingEmblem className="text-red-600 text-5xl" aria-hidden="true" />
      </div>

      <div className="flex justify-center mb-6">
        <FaCheckCircle className="text-green-500 text-6xl" aria-hidden="true" />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">¡Registro Exitoso!</h1>

      <p className="text-xl text-gray-600 mb-8">
        Bienvenido a la familia <span className="text-red-600 font-bold">BSK Motorcycle Team</span>. Tu registro como miembro <span className="font-semibold">Friend</span> ha sido completado con éxito.
      </p>

      <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200" role="alert">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">⚠️ Verificación de correo requerida</h3>
        <p className="text-amber-700 mb-3">
          Tu cuenta ha sido creada pero <strong>necesita ser verificada</strong> antes de que puedas iniciar sesión.
        </p>
        <p className="text-amber-700">
          Hemos enviado un correo de verificación a <span className="font-semibold">{userEmail || 'tu dirección de correo'}</span>. 
          <strong> Debes hacer clic en el enlace de verificación para activar tu cuenta.</strong>
        </p>
      </div>

      <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📧 Revisa tu correo</h3>
        <p className="text-blue-700 text-sm">
          • Revisa tu bandeja de entrada y la carpeta de spam<br/>
          • El correo puede tardar unos minutos en llegar<br/>
          • Si no lo recibes, puedes solicitar un reenvío desde la página de verificación
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Próximos pasos:
        </h2>

        <div className="space-y-4">
          {[
            {
              title: '1. Verifica tu correo electrónico:',
              text: 'Haz clic en el enlace de verificación que enviamos a tu correo para activar tu cuenta.'
            },
            {
              title: '2. Inicia sesión:',
              text: 'Una vez verificado tu email, podrás iniciar sesión en tu cuenta y acceder a tu dashboard.'
            },
            {
              title: '3. Completa tu perfil:',
              text: 'Revisa y actualiza cualquier información adicional en tu perfil de usuario.'
            },
            {
              title: '4. Únete a la comunidad:',
              text: 'Explora eventos, conecta con otros miembros y disfruta de tu membresía en BSK Motorcycle Team.'
            }
          ].map((step, index) => (
            <div className="flex items-start" key={index}>
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">{step.title}</span> {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/verify-email"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          aria-label="Ir a verificación de email"
        >
          Verificar Email
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          aria-label="Volver al Inicio"
        >
          Volver al Inicio
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 border border-red-600 text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          aria-label="Iniciar Sesión"
        >
          Iniciar Sesión
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          ¿Tienes preguntas? Contáctanos en <a href="mailto:soporte@bskmt.com" className="text-red-600 hover:text-red-800">soporte@bskmt.com</a>
        </p>
      </div>
    </div>
  );
};

const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-gray-500">Cargando...</div>}>
        <ContentWithSearchParams />
      </Suspense>
    </div>
  );
};

export default RegistrationSuccess;