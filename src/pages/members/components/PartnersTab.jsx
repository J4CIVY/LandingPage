import React from 'react';
import { FaStar } from 'react-icons/fa';

const PartnersTab = ({ userData }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Aliados Comerciales BSK</h3>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-800 mb-3">Categorías:</h4>
        <div className="flex flex-wrap gap-2">
          <button className="bg-slate-950 text-white px-3 py-1 rounded-full text-sm">Todos</button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Talleres</button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Accesorios</button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Seguros</button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Hoteles</button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm">Restaurantes</button>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="p-4 md:p-6 flex flex-col md:flex-row">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img
                src="https://via.placeholder.com/120"
                alt="Partner Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-800 mb-1">Talleres MotoPro</h4>
              <div className="flex items-center text-sm text-yellow-600 mb-2">
                <FaStar className="mr-1" /> 15% descuento para miembros BSK
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Especialistas en motocicletas Harley-Davidson y custom. Servicio premium con garantía.
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Ubicación:</span> Bogotá, Medellín, Cali
              </div>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
              <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                Ver Detalles
              </button>
              <button className="bg-slate-950 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm transition">
                Obtener Cupón
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="p-4 md:p-6 flex flex-col md:flex-row">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img
                src="https://via.placeholder.com/120"
                alt="Partner Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-800 mb-1">Motopartes Elite</h4>
              <div className="flex items-center text-sm text-yellow-600 mb-2">
                <FaStar className="mr-1" /> 10% descuento + 50 puntos por compra
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Todo en repuestos y accesorios para tu moto. Envíos a todo el país.
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Ubicación:</span> Envíos a todo el país
              </div>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
              <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                Ver Detalles
              </button>
              <button className="bg-slate-950 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm transition">
                Obtener Cupón
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="p-4 md:p-6 flex flex-col md:flex-row">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img
                src="https://via.placeholder.com/120"
                alt="Partner Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-800 mb-1">Hotel Motero</h4>
              <div className="flex items-center text-sm text-yellow-600 mb-2">
                <FaStar className="mr-1" /> 20% descuento + estacionamiento seguro
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Hotel especializado para motociclistas con taller básico y seguridad para tu moto.
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Ubicación:</span> Ruta Norte, Santander
              </div>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
              <button className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm transition">
                Ver Detalles
              </button>
              <button className="bg-slate-950 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm transition">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-3">¿Cómo ganar puntos con aliados?</h4>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li className="pl-2">Visita a un aliado comercial BSK</li>
          <li className="pl-2">Menciona que eres miembro BSK al hacer tu compra</li>
          <li className="pl-2">Pide que registren tu membresía en la compra</li>
          <li className="pl-2">Los puntos se acreditarán automáticamente en 24-48 horas</li>
          <li className="pl-2">Verifica tu saldo de puntos en esta plataforma</li>
        </ol>
        <div className="text-xs text-blue-600 mt-3">
          * Algunos aliados pueden ofrecer puntos adicionales por compras especiales
        </div>
      </div>
    </div>
  );
};

export default PartnersTab;