import React, { useState, useEffect } from "react";

const Weather = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  return (
    <div className="min-h-screen bg-[#ffffff]">
      
      {/* Título y última actualización */}
      <section className="bg-slate-950 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Clima para Motociclistas - Bogotá</h1>
          <p className="text-green-400">
            Última actualización: {formatDate(lastUpdated)}
          </p>
        </div>
      </section>

      {/* Contenedor de mapas */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
          {/* Radar de lluvias - SIRE */}
          <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
            <div className="bg-slate-950 text-white p-4">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Radar de Precipitaciones
              </h2>
              <p className="text-sm text-gray-300">Fuente: SIRE - Ideam</p>
            </div>
            <div className="h-96 md:h-[500px]">
              <iframe
                key={lastUpdated.getTime()}
                src="https://evp.sire.gov.co/radar_animate/inicio.html"
                title="Radar de precipitaciones Bogotá"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>

          {/* Mapa de lluvias - SAB */}
          <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
            <div className="bg-slate-950 text-white p-4">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Red de Monitoreo de Lluvias
              </h2>
              <p className="text-sm text-gray-300">Fuente: Acueducto de Bogotá</p>
            </div>
            <div className="h-96 md:h-[500px]">
              <iframe
                key={lastUpdated.getTime()}
                src="https://app.sab.gov.co/sab/lluvias.htm"
                title="Red de monitoreo de lluvias Bogotá"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Recomendaciones para motociclistas */}
        <div className="mt-12 bg-slate-950 border border-green-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Recomendaciones para Motociclistas
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>En lluvia intensa, reduce velocidad y aumenta distancia de frenado</span>
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
        <p>Los mapas mostrados son propiedad de SIRE (Ideam) y Acueducto de Bogotá.</p>
        <p>BSK Motorcycle Team proporciona este servicio como referencia para sus miembros.</p>
      </div>
    </div>
  );
};

export default Weather;