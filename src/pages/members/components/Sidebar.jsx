import React from 'react';
import { FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ userData, logout }) => (
  <aside className="hidden lg:block w-64 bg-white rounded-lg shadow-sm p-4">
    <div className="flex items-center mb-8">
      <img
        src={userData.avatar}
        alt="Avatar"
        className="w-16 h-16 rounded-full border-2 border-slate-950 mr-4 object-cover"
      />
      <div>
        <h2 className="font-bold text-slate-950">{userData.name}</h2>
        <div className="flex items-center">
          <FaStar className="text-green-400 mr-1" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{userData.points} Puntos</span>
        </div>
      </div>
    </div>

    <div className="space-y-2 mb-8">
      <button className="w-full flex items-center bg-gray-100 text-green-400 px-4 py-3 rounded-lg font-semibold shadow-sm">
        <FaBell className="mr-3" aria-hidden="true" /> Notificaciones
      </button>
      <button className="w-full flex items-center bg-gray-100 text-slate-950 px-4 py-3 rounded-lg font-semibold shadow-sm">
        <FaCog className="mr-3" aria-hidden="true" /> Configuración
      </button>
      <button
        onClick={logout}
        className="w-full flex items-center bg-gray-100 text-slate-950 px-4 py-3 rounded-lg font-semibold shadow-sm"
      >
        <FaSignOutAlt className="mr-3" aria-hidden="true" /> Cerrar sesión
      </button>
    </div>
  </aside>
);

export default Sidebar;