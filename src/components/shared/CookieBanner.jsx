import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent !== 'accepted') {
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 100); // Pequeño delay para la animación
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300); // Espera a que termine la animación
  };

  if (!showBanner) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#000031] text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Política de Cookies</h3>
            <p className="text-sm">
              BSK Motorcycle Team utiliza cookies para mejorar tu experiencia en nuestro sitio web. 
              Al continuar navegando, aceptas nuestro uso de cookies. Para más información, 
              consulta nuestra <a href="/politica-de-privacidad" className="text-[#00ff99] hover:underline">Política de Privacidad</a>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={acceptCookies}
              className="bg-[#00ff99] hover:bg-[#00e68a] text-[#000031] font-bold py-2 px-6 rounded transition-colors duration-200"
            >
              Aceptar
            </button>
            <button 
              onClick={() => window.location.href = '/politica-de-privacidad'}
              className="border border-white hover:bg-white hover:text-[#000031] font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;