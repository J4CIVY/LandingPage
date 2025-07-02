import React, { useState, useEffect } from "react";
import { 
  FaCloudRain,
  FaRadiation,
  FaExclamationTriangle,
  FaClock,
  FaMotorcycle,
  FaMapMarkedAlt
} from "react-icons/fa";
import { 
  WiDaySunny,
  WiRaindrop
} from "react-icons/wi";

const Weather = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('radar'); // Estado para controlar la pestaña activa

  // Actualizar cada 2.5 minutos (150000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 150000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para formatear la fecha
  const formatDate = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Contenido de las pestañas
  const tabs = [
    {
      id: 'radar',
      title: 'Radar de Precipitaciones',
      icon: <FaRadiation className="w-6 h-6 mr-2" />,
      content: (
        <iframe
          key={lastUpdated.getTime()}
          src="https://evp.sire.gov.co/radar_animate/inicio.html"
          title="Radar de precipitaciones Animado Bogotá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'lluvias',
      title: 'Red de Monitoreo de Lluvias',
      icon: <WiRaindrop className="w-6 h-6 mr-2" />,
      content: (
        <iframe
          key={lastUpdated.getTime()}
          src="https://app.sab.gov.co/sab/lluvias.htm"
          title="Radar de precipitaciones En Tiempo Real Bogotá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
      ),
      source: "Fuente: Instituto Distrital de Gestión de Riesgos y Cambio Climático"
    },
    {
      id: 'siata',
      title: 'Geoportal',
      icon: <FaMapMarkedAlt className="w-6 h-6 mr-2" />,
      content: (
        <iframe
          key={lastUpdated.getTime()}
          src="https://siata.gov.co/siata_nuevo/"
          title="Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
      ),
      source: "Fuente: Sistema de Alerta Temprana de Medellín y el Valle de Aburrá"
    }
  ];

  return (
    <div className="min-h-screen bg-[#ffffff]">
      
      {/* Título y última actualización */}
      <section className="bg-slate-950 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            <FaMotorcycle className="mr-2" /> Clima para Motociclistas - Bogotá
          </h1>
          <p className="text-green-400 flex items-center">
            <FaClock className="mr-1" /> Última actualización: {formatDate(lastUpdated)}
          </p>
        </div>
      </section>

      {/* Contenedor de pestañas */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        {/* Navegación de pestañas */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-6 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-green-400 text-green-400' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
          <div className="bg-slate-950 text-white p-4">
            <h2 className="text-xl font-bold flex items-center">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              {tabs.find(tab => tab.id === activeTab)?.title}
            </h2>
            <p className="text-sm text-gray-300">
              {tabs.find(tab => tab.id === activeTab)?.source}
            </p>
          </div>
          <div className="h-96 md:h-[500px]">
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>
        </div>

        {/* Recomendaciones para motociclistas */}
        <div className="mt-12 bg-slate-950 border border-green-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FaExclamationTriangle className="w-6 h-6 mr-2 text-green-400" />
            Recomendaciones para Motociclistas
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span className="text-white">En lluvia intensa, reduce velocidad y aumenta distancia de frenado</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Evita zonas marcadas en rojo/naranja en los mapas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Usa equipo impermeable y con buena visibilidad</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Precaución con hidroplaneo en vías como Autopista Norte o Calle 80</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Nota legal */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>Los mapas mostrados son propiedad de SIRE (Ideam), Acueducto de Bogotá y SIATA.</p>
        <p>BSK Motorcycle Team proporciona este servicio como referencia para sus miembros.</p>
      </div>
    </div>
  );
};

export default Weather;