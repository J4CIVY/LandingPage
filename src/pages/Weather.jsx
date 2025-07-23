import React, { useState, useEffect, useCallback } from "react"; // Added useCallback for memoization
import { 
  FaCloudRain,
  FaRadiation,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkedAlt
} from "react-icons/fa";
import { 
  WiDaySunny, // Not used, can be removed if not intended for future use
  WiRaindrop
} from "react-icons/wi";

const Weather = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // This state is declared but not used in rendering logic
  const [activeTab, setActiveTab] = useState('radar');

  // Effect to update lastUpdated timestamp and handle window resize
  useEffect(() => {
    // Set interval for updating timestamp
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 150000); // 2.5 minutes (150000 ms)

    // Handle window resize for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup function for useEffect
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Memoized function to format the date for display
  const formatDate = useCallback((date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []); // Empty dependency array means this function is created once

  // Content for the tabs, memoized to prevent re-creation on every render
  const tabs = useCallback(() => [
    {
      id: 'radar',
      title: 'Radar de Precipitaciones',
      icon: <FaRadiation className="w-6 h-6 mr-2" aria-hidden="true" />, // Added aria-hidden
      content: (
        <iframe
          key={`radar-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://evp.sire.gov.co/radar_animate/inicio.html"
          title="Radar de precipitaciones Animado Bogotá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'lluvias',
      title: 'Red de Monitoreo de Lluvias',
      icon: <WiRaindrop className="w-6 h-6 mr-2" aria-hidden="true" />, // Added aria-hidden
      content: (
        <iframe
          key={`lluvias-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://app.sab.gov.co/sab/lluvias.htm"
          title="Radar de precipitaciones En Tiempo Real Bogotá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'siata',
      title: 'Geoportal',
      icon: <FaMapMarkedAlt className="w-6 h-6 mr-2" aria-hidden="true" />, // Added aria-hidden
      content: (
        <iframe
          key={`siata-${lastUpdated.getTime()}`} // Key ensures iframe re-renders on update
          src="https://siata.gov.co/siata_nuevo/"
          title="Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security: Restrict iframe capabilities
        />
      ),
      source: "Fuente: Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
    }
  ], [lastUpdated]); // Dependency on lastUpdated to update iframe keys

  const currentTabs = tabs(); // Call the memoized function to get the tabs array

  return (
    <div className="min-h-screen bg-[#ffffff]">
      
      {/* Título y última actualización */}
      <section className="bg-slate-950 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            Clima para Motociclistas - Bogotá Y Medellín
          </h1>
          <p className="text-green-400 flex items-center">
            <FaClock className="mr-1" aria-hidden="true" /> {/* Added aria-hidden */}
            Última actualización: {formatDate(lastUpdated)}
          </p>
        </div>
      </section>

      {/* Contenedor de pestañas */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        {/* Navegación de pestañas */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto" role="tablist"> {/* Added role for accessibility */}
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-6 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-green-400 text-green-400' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab" // Added role for accessibility
              aria-selected={activeTab === tab.id} // Added aria-selected for accessibility
              id={`tab-${tab.id}`} // Added id for accessibility
              aria-controls={`panel-${tab.id}`} // Added aria-controls for accessibility
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        {currentTabs.map(tab => (
          <div 
            key={tab.id}
            role="tabpanel" // Added role for accessibility
            id={`panel-${tab.id}`} // Added id for accessibility
            aria-labelledby={`tab-${tab.id}`} // Added aria-labelledby for accessibility
            hidden={activeTab !== tab.id} // Hide panels that are not active
          >
            {activeTab === tab.id && ( // Only render content if tab is active
              <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
                <div className="bg-slate-950 text-white p-4">
                  <h2 className="text-xl font-bold flex items-center">
                    {tab.icon}
                    {tab.title}
                  </h2>
                  <p className="text-sm text-gray-300">
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

        {/* Recomendaciones para motociclistas */}
        <div className="mt-12 bg-slate-950 border border-green-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FaExclamationTriangle className="w-6 h-6 mr-2 text-green-400" aria-hidden="true" /> {/* Added aria-hidden */}
            Recomendaciones para Motociclistas
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">•</span> {/* Added aria-hidden */}
              <span className="text-white">En lluvia intensa, reduce velocidad y aumenta distancia de frenado</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">•</span> {/* Added aria-hidden */}
              <span className="text-white">Evita zonas marcadas en rojo/naranja en los mapas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">•</span> {/* Added aria-hidden */}
              <span className="text-white">Usa equipo impermeable y con buena visibilidad</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2" aria-hidden="true">•</span> {/* Added aria-hidden */}
              <span className="text-white"> Precaución con hidroplaneo en vías como Autopista Norte o Calle 80</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Nota legal */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>Los mapas mostrados son propiedad del Instituto Distrital de Gestión de Riesgos y Cambio Climático (IDIGER), y el Sistema de Alerta Temprana de Medellín y el Valle de Aburrá (SIATA).</p>
        <p>BSK Motorcycle Team proporciona este servicio como referencia para sus miembros.</p>
      </div>
    </div>
  );
};

export default Weather;