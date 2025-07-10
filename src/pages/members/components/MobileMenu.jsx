import React from 'react';
import { Tab, Tabs, TabList } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {
  FaUserCog, FaCalendarAlt, FaMotorcycle,
  FaStar, FaMedal, FaHeadset, FaUsers,
  FaStore, FaBell, FaCog, FaSignOutAlt,
  FaTimes
} from 'react-icons/fa';

const MobileMenu = ({ userData, activeTab, setActiveTab, setMobileMenuOpen, logout }) => (
  <div className="lg:hidden fixed inset-0 z-20 bg-gray-900 bg-opacity-75" role="dialog" aria-modal="true">
    <div className="absolute top-[80px] left-0 bottom-0 w-4/5 max-w-xs">
      <div className="bg-white h-full p-4 overflow-y-auto rounded-r-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img
              src={userData.avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-slate-950 mr-3 object-cover"
            />
            <div>
              <h2 className="font-bold text-slate-950">{userData.name}</h2>
              <div className="flex items-center">
                <FaStar className="text-green-400 mr-1" aria-hidden="true" />
                <span className="font-semibold text-slate-900">{userData.points} Puntos</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 rounded"
            aria-label="Cerrar menú"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-1 mb-6">
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

        <Tabs
          selectedIndex={activeTab}
          onSelect={index => {
            setActiveTab(index);
            setMobileMenuOpen(false);
          }}
          className="mb-6"
        >
          <TabList className="flex flex-col space-y-2" aria-label="Secciones del área de miembro">
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaUserCog className="mr-3" aria-hidden="true" /> Mi Cuenta
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaCalendarAlt className="mr-3" aria-hidden="true" /> Mis Eventos
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaMotorcycle className="mr-3" aria-hidden="true" /> Próximas Rodadas
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaStar className="mr-3" aria-hidden="true" /> Mis Puntos
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaMedal className="mr-3" aria-hidden="true" /> Mi Membresía
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaHeadset className="mr-3" aria-hidden="true" /> PQRSDF
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaUsers className="mr-3" aria-hidden="true" /> Comunidad
            </Tab>
            <Tab className="px-4 py-3 text-left flex items-center rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600">
              <FaStore className="mr-3" aria-hidden="true" /> Aliados
            </Tab>
          </TabList>
        </Tabs>
      </div>
    </div>
  </div>
);

export default MobileMenu;