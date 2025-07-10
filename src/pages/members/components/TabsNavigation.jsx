import React from 'react';
import { Tab, Tabs, TabList } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {
  FaUserCog, FaCalendarAlt, FaMotorcycle,
  FaStar, FaMedal, FaHeadset, FaUsers,
  FaStore
} from 'react-icons/fa';

const TabsNavigation = ({ activeTab, setActiveTab, userData }) => (
  <Tabs
    selectedIndex={activeTab}
    onSelect={index => setActiveTab(index)}
    className="hidden lg:block"
    aria-label="Secciones del área de miembro"
  >
    <TabList className="flex overflow-x-auto border-b border-gray-200">
      {[
        { icon: FaUserCog, label: "Mi Cuenta" },
        { icon: FaCalendarAlt, label: "Mis Eventos" },
        { icon: FaMotorcycle, label: "Próximas Rodadas" },
        { icon: FaStar, label: "Mis Puntos" },
        { icon: FaMedal, label: "Mi Membresía" },
        { icon: FaHeadset, label: "PQRSDF" },
        { icon: FaUsers, label: "Comunidad" },
        { icon: FaStore, label: "Aliados" }
      ].map(({ icon: Icon, label }, i) => (
        <Tab
          key={label}
          className="px-6 py-3 text-base font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 border-b-2 border-transparent hover:text-green-500 hover:border-red-500 transition flex items-center whitespace-nowrap"
        >
          <Icon className="mr-3" aria-hidden="true" /> {label}
        </Tab>
      ))}
    </TabList>
  </Tabs>
);

export default TabsNavigation;