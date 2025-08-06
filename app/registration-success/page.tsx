'use client';

import React from 'react';
import { GiSteelwingEmblem } from 'react-icons/gi';
import { FaCheckCircle } from 'react-icons/fa'; 
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * RegistrationSuccess component displays a success message after user registration.
 * It includes next steps and contact information.
 * @returns {JSX.Element}
 */
const RegistrationSuccess: React.FC = () => {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('userEmail');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <GiSteelwingEmblem className="text-red-600 text-5xl" aria-hidden="true" />
        </div>
        
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" aria-hidden="true" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          ¡Registro Exitoso!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Bienvenido a la familia <span className="text-red-600 font-bold">BSK Motorcycle Team</span>. Tu registro como miembro <span className="font-semibold">Friend</span> ha sido completado con éxito.
        </p>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200" role="alert">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Verifica tu correo electrónico</h3>
          <p className="text-blue-700">
            Hemos enviado un correo de confirmación a <span className="font-semibold">{userEmail || 'tu dirección de correo'}</span>. 
            Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar tu mensaje de bienvenida.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Próximos pasos:
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Revisa tu correo electrónico:</span> Hemos enviado un mensaje de confirmación con los detalles de tu membresía y credenciales de acceso.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Verificación manual:</span> Nuestro equipo verificará tu información en las próximas 24-48 horas. Te contactaremos si necesitamos algún documento adicional.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Activación completa:</span> Tu membresía estará totalmente activa después de la verificación. Recibirás una notificación cuando esto ocurra.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Primer evento:</span> Mantente atento a nuestras comunicaciones para participar en tu primera rodada como miembro oficial.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
    </div>
  );
};

export default RegistrationSuccess;
