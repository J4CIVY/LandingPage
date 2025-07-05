import React from 'react';
import { GiSteelwingEmblem } from 'react-icons/gi';
import { FaCheckCircle, FaEnvelope, FaPhone, FaMotorcycle, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <GiSteelwingEmblem className="text-red-600 text-5xl" />
        </div>
        
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          ¡Registro Exitoso!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Bienvenido a la familia <span className="text-red-600 font-bold">BSK Motorcycle Team</span>. Tu registro como miembro <span className="font-semibold">Friend</span> ha sido completado con éxito.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Próximos pasos:
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-red-600">
                <FaEnvelope className="text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  <span className="font-medium">Revisa tu correo electrónico:</span> Hemos enviado un mensaje de confirmación con los detalles de tu membresía y credenciales de acceso.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-red-600">
                <FaPhone className="text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  <span className="font-medium">Verificación manual:</span> Nuestro equipo verificará tu información en las próximas 24-48 horas. Te contactaremos si necesitamos algún documento adicional.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-red-600">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  <span className="font-medium">Activación completa:</span> Tu membresía estará totalmente activa después de la verificación. Recibirás una notificación cuando esto ocurra.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-red-600">
                <FaMotorcycle className="text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  <span className="font-medium">Primer evento:</span> Mantente atento a nuestras comunicaciones para participar en tu primera rodada como miembro oficial.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 text-left">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📌 Kit de Bienvenida</h3>
          <p className="text-blue-700">
            Tu kit físico de bienvenida (carnet, parches y manual) será entregado en tu primer evento con nosotros. Para acceder a beneficios digitales inmediatos, inicia sesión en nuestra plataforma.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Volver al Inicio
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-red-600 text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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