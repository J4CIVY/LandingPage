'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  FaRadiation,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkedAlt
} from "react-icons/fa";
import { 
  WiRaindrop
} from "react-icons/wi";
import SEOComponent from '@/components/home/SEOComponent';

/**
 * @typedef {Object} TabContent
 * @property {string} id - Unique identifier for the tab.
 * @property {string} title - Title displayed on the tab.
 * @property {React.ReactElement} icon - Icon for the tab.
 * @property {React.ReactElement} content - JSX content for the tab panel.
 * @property {string} source - Source of the data displayed in the tab.
 */
interface TabContent {
  id: string;
  title: string;
  icon: React.ReactElement;
  content: React.ReactElement;
  source: string;
}

/**
 * Weather component displays weather information for motorcyclists, including precipitation radar and monitoring networks.
 * It uses iframes to embed external weather services.
 * @returns {React.ReactElement}
 */
const Weather: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('radar');

  // Effect to update lastUpdated timestamp
  useEffect(() => {
    // Set interval for updating timestamp
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 150000); // 2.5 minutes (150000 ms)
    
    // Cleanup function for useEffect
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  /**
   * Formats a Date object into a time string.
   * This function is memoized using useCallback.
   * @param {Date} date - The date object to format.
   * @returns {string} The formatted time string.
   */
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []); // Empty dependency array means this function is created once

  /**
   * Defines the content for each tab.
   * This function is memoized using useCallback.
   * @returns {TabContent[]} An array of tab content objects.
   */
  const tabs = useCallback((): TabContent[] => [
    {
      id: 'radar',
      title: 'Radar de Precipitaciones',
      icon: <FaRadiation className="w-6 h-6 mr-2" aria-hidden="true" />,
      content: (
        <iframe
          key={`radar-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://evp.sire.gov.co/radar_animate/inicio.html"
          title="Radar de precipitaciones Animado Bogotá"
          className="w-full h-full"
          frameBorder={0}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'lluvias',
      title: 'Red de Monitoreo de Lluvias',
      icon: <WiRaindrop className="w-6 h-6 mr-2" aria-hidden="true" />,
      content: (
        <iframe
          key={`lluvias-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://app.sab.gov.co/sab/lluvias.htm"
          title="Radar de precipitaciones En Tiempo Real Bogotá"
          className="w-full h-full"
          frameBorder={0}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'siata',
      title: 'Geoportal',
      icon: <FaMapMarkedAlt className="w-6 h-6 mr-2" aria-hidden="true" />,
      content: (
        <iframe
          key={`siata-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://siata.gov.co/siata_nuevo/"
          title="Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
          className="w-full h-full"
          frameBorder={0}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
    }
  ], [lastUpdated]); // Dependency on lastUpdated to update iframe keys

  const currentTabs = tabs(); // Call the memoized function to get the tabs array

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEOComponent
        title="Clima para Motociclistas - BSK Motorcycle Team"
        description="Consulta el clima en tiempo real para Bogotá y Medellín. Radar de precipitaciones y redes de monitoreo para planificar tus rutas de forma segura."
      />
      {/* Title and last updated */}
      <section className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            Clima para Motociclistas - Bogotá Y Medellín
          </h1>
          <p className="text-green-400 flex items-center">
            <FaClock className="mr-1" aria-hidden="true" />
            Última actualización: {formatDate(lastUpdated)}
          </p>
        </div>
      </section>

      {/* Tabs container */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-600 mb-6 overflow-x-auto" role="tablist">
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-6 font-medium text-sm flex items-center whitespace-nowrap focus:outline-none ${activeTab === tab.id ? 'border-b-2 border-green-400 text-green-400 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        {currentTabs.map(tab => (
          <div 
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {activeTab === tab.id && ( // Only render content if tab is active
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white p-4">
                  <h2 className="text-xl font-bold flex items-center">
                    {tab.icon}
                    {tab.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tab.source}
                  </p>
                </div>
                <div className="h-96 md:h-[500px]">
                  {tab.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Recommendations for motorcyclists */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-green-400 dark:border-green-500 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-4 flex items-center">
            <FaExclamationTriangle className="w-6 h-6 mr-2 text-green-400 dark:text-green-300" aria-hidden="true" />
            Recomendaciones para Motociclistas
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start">
              <span className="text-green-400 dark:text-green-300 mr-2" aria-hidden="true">•</span>
              <span className="text-slate-950 dark:text-white">En lluvia intensa, reduce velocidad y aumenta distancia de frenado</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 dark:text-green-300 mr-2" aria-hidden="true">•</span>
              <span className="text-slate-950 dark:text-white">Evita zonas marcadas en rojo/naranja en los mapas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 dark:text-green-300 mr-2" aria-hidden="true">•</span>
              <span className="text-slate-950 dark:text-white">Usa equipo impermeable y con buena visibilidad</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 dark:text-green-300 mr-2" aria-hidden="true">•</span>
              <span className="text-slate-950 dark:text-white">Precaución con hidroplaneo en vías como Autopista Norte o Calle 80</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Legal note */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Los mapas mostrados son propiedad del Instituto Distrital de Gestión de Riesgos y Cambio Climático (IDIGER), y el Sistema de Alerta Temprana de Medellín y el Valle de Aburrá (SIATA).</p>
        <p>BSK Motorcycle Team proporciona este servicio como referencia para sus miembros.</p>
      </div>
    </div>
  );
};

export default Weather;