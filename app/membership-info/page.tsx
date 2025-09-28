'use client';

import React from 'react';
import { FaMotorcycle, FaShieldAlt, FaUsers, FaMedal, FaHandsHelping } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import Link from 'next/link';
/**
 * MembershipInfoPage component provides detailed information about the "Friend" membership.
 * It outlines benefits, duties, and obligations, and includes links for navigation.
 * @returns {JSX.Element}
 */
const MembershipInfoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <GiSteelwingEmblem className="text-red-600 dark:text-red-400 text-5xl" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Membresía <span className="text-red-600 dark:text-red-400">Friend</span> de BSK Motorcycle Team
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-300">
            Conoce todo sobre nuestra membresía básica y únete a nuestra comunidad motera
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">¿Qué es la Membresía Friend?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            La Membresía Friend es tu puerta de entrada al mundo BSK Motorcycle Team. Es el nivel básico de membresía diseñado para moteros que quieren ser parte de nuestra comunidad, disfrutar de beneficios exclusivos y crecer con nosotros.
          </p>
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 dark:border-red-400 p-4 mb-6" role="alert">
            <p className="text-red-800 dark:text-red-200 font-medium">
              "Ser miembro de BSK no es solo tener un carnet, es adoptar un estilo de vida motero con valores, comunidad y pasión por las dos ruedas."
            </p>
          </div>
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
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Respeto a la comunidad:</span> Todo miembro debe mantener una conducta respetuosa con otros miembros y con la imagen del club.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Seguridad vial:</span> Cumplir con las normas de tránsito y promover la conducción segura en todas las actividades.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
                  <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Pago oportuno:</span> Mantener al día los pagos de la membresía según la periodicidad establecida.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
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
