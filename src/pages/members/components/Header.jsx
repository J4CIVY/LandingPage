import React from 'react';
import { FaStar, FaMedal, FaBell, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ userData, mobileMenuOpen, setMobileMenuOpen, logout }) => (
  <>
    {/* Header Mobile */}
    <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
      <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
        <div className="flex items-center">
          <img
            src={userData.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-slate-950 mr-3 object-cover"
          />
          <div>
            <h2 className="font-bold text-slate-950 text-sm truncate max-w-[120px]" title={userData.name}>{userData.name}</h2>
            <div className="flex items-center">
              <FaStar className="text-green-400 mr-1 text-xs" aria-hidden="true" />
              <span className="font-semibold text-slate-900 text-xs">{userData.points} pts</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 rounded"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
    </div>

    {/* Header Desktop */}
    <header className="hidden lg:flex p-6 justify-between items-center border-b border-slate-900">
      <div className="flex items-center">
        <img
          src={userData.avatar}
          alt="Avatar"
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-950 mr-4 object-cover"
        />
        <div>
          <h2 className="text-3xl font-extrabold text-slate-950 leading-tight">{userData.name}</h2>
          <div className="flex items-center mt-2 space-x-4">
            <span className="bg-gradient-to-r from-slate-950 to-green-400 text-white text-sm md:text-base px-4 py-1 rounded-full flex items-center shadow-sm font-semibold">
              <FaMedal className="mr-2" aria-hidden="true" /> {userData.membership}
              {userData.membershipExpiry && (
                <span className="ml-3 text-white text-opacity-90 text-sm md:text-base" title={`Vence: ${userData.membershipExpiry}`}>Vence: {userData.membershipExpiry}</span>
              )}
            </span>
            <div className="flex items-center text-green-400">
              <FaStar className="mr-1" aria-hidden="true" />
              <span className="font-semibold text-slate-900 text-lg">{userData.points} Puntos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-base font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-600">
          <FaBell className="mr-3" aria-hidden="true" /> Notificaciones
        </button>
        <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-base font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-600">
          <FaCog className="mr-3" aria-hidden="true" /> Configuración
        </button>
        <button
          onClick={logout}
          className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-base font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <FaSignOutAlt className="mr-3" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </header>
  </>
);

export default Header;