import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 p-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h4 className="font-semibold mb-6 text-lg">Contactos de Emergencia:</h4>
          <ul className="space-y-4">
            <li className="flex items-center">
              <FaShieldAlt className="mr-3 text-slate-950" aria-hidden="true" />
              <span>Asistencia Vial BSK: 018000-123456</span>
            </li>
            <li className="flex items-center">
              <FaShieldAlt className="mr-3 text-slate-950" aria-hidden="true" />
              <span>Emergencias Médicas: 123</span>
            </li>
            <li className="flex items-center">
              <FaShieldAlt className="mr-3 text-slate-950" aria-hidden="true" />
              <span>Policía de Carreteras: #767</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-6 text-lg">Enlaces Rápidos:</h4>
          <nav aria-label="Enlaces rápidos">
            <ul className="grid grid-cols-2 gap-4 text-sm">
              <li>
                <a href="#" className="hover:text-slate-950 transition">Reglamento del Club</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950 transition">Protocolos de Seguridad</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950 transition">Preguntas Frecuentes</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950 transition">Manual del Miembro</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 select-none">
        © {new Date().getFullYear()} BSK Motorcycle Team. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
