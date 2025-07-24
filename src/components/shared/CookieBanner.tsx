import React, { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {Object} CookieSettings
 * @property {boolean} essential - Essential cookies.
 * @property {boolean} performance - Performance cookies.
 * @property {boolean} functional - Functional cookies.
 * @property {boolean} marketing - Marketing cookies.
 * @property {boolean} social - Social media cookies.
 */
interface CookieSettings {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
  social: boolean;
}

/**
 * Augment the Window interface to include custom properties.
 */
declare global {
  interface Window {
    googleAnalyticsLoaded: boolean;
  }
}

/**
 * CookieBanner component displays a banner for cookie consent and settings.
 * @returns {JSX.Element | null}
 */
const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(() => {
    const savedSettings = localStorage.getItem('cookieSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      essential: true,
      performance: false,
      functional: false,
      marketing: false,
      social: false
    };
  });

  /**
   * Applies the current cookie settings.
   * This function is memoized using useCallback.
   * @param {CookieSettings} settings - The cookie settings to apply.
   */
  const applyCookieSettings = useCallback((settings: CookieSettings) => {
    console.log('Aplicando configuración de cookies:', settings);
    // Logic to load analytics scripts, etc.
    if (settings.performance && !window.googleAnalyticsLoaded) {
      // Simulate script loading
      console.log('Cargando script de Google Analytics...');
      window.googleAnalyticsLoaded = true; // Prevent double loading
    }
    // You could trigger events or update a global context here
  }, []);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    
    if (savedConsent !== 'accepted') {
      setShowBanner(true);
      // Small delay to allow DOM to update before opacity transition
      setTimeout(() => setIsVisible(true), 100);
    } else {
      // If already accepted, apply saved settings immediately
      applyCookieSettings(cookieSettings);
    }
  }, [applyCookieSettings, cookieSettings]); // Dependencies added

  /**
   * Hides the cookie banner with a transition.
   */
  const hideBanner = (): void => {
    setIsVisible(false);
    // Wait for opacity transition to finish before hiding the banner completely
    setTimeout(() => setShowBanner(false), 300);
  };

  /**
   * Accepts all cookie categories and hides the banner.
   */
  const acceptAll = (): void => {
    const allAccepted: CookieSettings = {
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
      social: true
    };
    
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieSettings', JSON.stringify(allAccepted));
    applyCookieSettings(allAccepted);
    hideBanner();
  };

  /**
   * Saves the current cookie settings and hides the banner.
   */
  const saveSettings = (): void => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
    applyCookieSettings(cookieSettings);
    hideBanner();
  };

  /**
   * Toggles the visibility of the cookie settings panel.
   */
  const toggleSettings = (): void => {
    setShowSettings(prev => !prev);
  };

  /**
   * Handles the change of a specific cookie setting.
   * @param {keyof CookieSettings} type - The type of cookie setting to change.
   */
  const handleSettingChange = (type: keyof CookieSettings): void => {
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-slate-950 text-white p-4 shadow-lg">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Política de Cookies</h3>
              <p className="text-sm">
                Nosotros y nuestros socios utilizamos cookies para almacenar y acceder a datos personales como los datos de navegación 
                para fines como servir y personalizar el contenido y analizar el tráfico del sitio. Puede elegir qué tipo de cookies permitir.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button 
                onClick={acceptAll}
                className="bg-green-400 hover:bg-[#00e68a] text-slate-950 font-bold py-2 px-4 rounded transition-colors duration-200 text-sm md:text-base"
                aria-label="Aceptar todas las cookies"
              >
                Aceptar todas
              </button>
              <button 
                onClick={toggleSettings}
                className="border border-white hover:bg-white hover:text-slate-950 font-bold py-2 px-4 rounded transition-colors duration-200 text-sm md:text-base"
                aria-label="Configurar preferencias de cookies"
              >
                Configurar
              </button>
              <button 
                onClick={saveSettings}
                className="bg-transparent hover:bg-white hover:text-slate-950 font-bold py-2 px-4 rounded transition-colors duration-200 text-sm md:text-base"
                aria-label="Guardar preferencias de cookies"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 id="cookie-settings-title" className="text-2xl font-bold text-slate-950">Configuración de Cookies</h3>
                <button 
                  onClick={toggleSettings}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Cerrar configuración de cookies"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Cookies esenciales</h4>
                      <p className="text-gray-600 text-sm">
                        Necesarias para el funcionamiento básico del sitio web. No se pueden desactivar.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer opacity-70" aria-label="Cookies esenciales (siempre activas)">
                      <input 
                        type="checkbox" 
                        checked={true}
                        disabled
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>

                {/* Performance Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Cookies de rendimiento</h4>
                      <p className="text-gray-600 text-sm">
                        Nos ayudan a entender cómo interactúan los visitantes con nuestro sitio web.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" aria-label="Activar cookies de rendimiento">
                      <input 
                        type="checkbox" 
                        checked={cookieSettings.performance}
                        onChange={() => handleSettingChange('performance')}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${cookieSettings.performance ? 'bg-green-400' : 'bg-gray-200'} peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white`}></div>
                    </label>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Cookies funcionales</h4>
                      <p className="text-gray-600 text-sm">
                        Permiten recordar tus preferencias y personalizar tu experiencia.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" aria-label="Activar cookies funcionales">
                      <input 
                        type="checkbox" 
                        checked={cookieSettings.functional}
                        onChange={() => handleSettingChange('functional')}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${cookieSettings.functional ? 'bg-green-400' : 'bg-gray-200'} peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white`}></div>
                    </label>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Cookies de marketing</h4>
                      <p className="text-gray-600 text-sm">
                        Utilizadas para rastrear visitantes a través de webs y mostrar anuncios relevantes.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" aria-label="Activar cookies de marketing">
                      <input 
                        type="checkbox" 
                        checked={cookieSettings.marketing}
                        onChange={() => handleSettingChange('marketing')}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${cookieSettings.marketing ? 'bg-green-400' : 'bg-gray-200'} peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white`}></div>
                    </label>
                  </div>
                </div>

                {/* Social Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Cookies de redes sociales</h4>
                      <p className="text-gray-600 text-sm">
                        Permiten compartir contenido en redes sociales y rastrear tu actividad.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" aria-label="Activar cookies de redes sociales">
                      <input 
                        type="checkbox" 
                        checked={cookieSettings.social}
                        onChange={() => handleSettingChange('social')}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${cookieSettings.social ? 'bg-green-400' : 'bg-gray-200'} peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white`}></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button 
                  onClick={toggleSettings}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  aria-label="Cancelar y cerrar configuración"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveSettings}
                  className="px-4 py-2 bg-slate-950 text-white rounded-md hover:bg-[#000050]"
                  aria-label="Guardar configuración de cookies"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;