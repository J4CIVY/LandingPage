'use client';

import React, { useState, useEffect } from 'react';
import { CookieSettings } from '@/types/cookies';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const settingsRef = useFocusTrap<HTMLDivElement>(showSettings);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        essential: true,
        performance: false,
        functional: false,
        marketing: false,
        social: false
      };
    }
    
    const defaultSettings = {
      essential: true,
      performance: false,
      functional: false,
      marketing: false,
      social: false
    };
    
    try {
      const savedSettings = localStorage.getItem('cookieSettings');
      if (savedSettings && savedSettings.trim() !== '') {
        return JSON.parse(savedSettings);
      }
      return defaultSettings;
    } catch (error) {
      console.warn('Error parsing cookie settings from localStorage:', error);
  // Limpia localStorage corrupto si existe un valor inválido
      localStorage.removeItem('cookieSettings');
      return defaultSettings;
    }
  });

  const applyCookieSettings = (settings: CookieSettings) => {
    console.log('Applying cookie settings:', settings);
    if (settings.performance && !(window as any).googleAnalyticsLoaded) {
      console.log('Loading Google Analytics script...');
      (window as any).googleAnalyticsLoaded = true;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
  // Verifica el consentimiento de cookies desde la cookie segura
      const cookies = document.cookie.split(';');
      const consentCookie = cookies.find(cookie => 
        cookie.trim().startsWith('cookieConsent=')
      );
      const hasConsent = consentCookie?.includes('accepted');

      if (!hasConsent) {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      } else {
        applyCookieSettings(cookieSettings);
      }
    }
  }, [cookieSettings]);

  const hideBanner = (): void => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const acceptAll = (): void => {
    const allAccepted: CookieSettings = {
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
      social: true
    };
    
  // Establece la cookie segura
    document.cookie = `cookieConsent=accepted; path=/; max-age=${365 * 24 * 60 * 60}; secure; samesite=strict`;
    
    localStorage.setItem('cookieSettings', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    
    applyCookieSettings(allAccepted);
    hideBanner();
  };

  const saveSettings = (): void => {
    const secureSettings = {
      secure: true,
      sameSite: 'strict' as const,
      httpOnly: false,
      maxAge: 365 * 24 * 60 * 60,
    };

  // Alternativa: usar un enfoque más seguro para almacenar el consentimiento
    document.cookie = `cookieConsent=accepted; path=/; max-age=${secureSettings.maxAge}; secure; samesite=strict`;
    
  // Guarda los ajustes en localStorage (solo datos no sensibles)
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    
    applyCookieSettings(cookieSettings);
    hideBanner();
  };

  const toggleSettings = (): void => {
    setShowSettings(prev => !prev);
  };

  // Maneja la tecla ESC para cerrar el modal de ajustes
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSettings]);

  const handleSettingChange = (type: keyof CookieSettings): void => {
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-slate-950 dark:bg-slate-800 text-white dark:text-gray-100 p-4 shadow-lg">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 text-slate-950 dark:text-white">Política de Cookies</h3>
              <p className="text-sm text-gray-100 dark:text-gray-300">
                Nosotros y nuestros socios utilizamos cookies para almacenar y acceder a datos personales como los datos de navegación 
                para fines como servir y personalizar el contenido y analizar el tráfico del sitio. Puede elegir qué tipo de cookies permitir.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button 
                onClick={acceptAll}
                className="bg-green-400 hover:bg-[#00e68a] text-slate-950 font-bold py-2 px-4 rounded text-sm md:text-base dark:bg-green-500 dark:hover:bg-green-600 dark:text-slate-900"
                aria-label="Aceptar todas las cookies"
              >
                Aceptar todas
              </button>
              <button 
                onClick={toggleSettings}
                className="border border-white dark:border-gray-400 hover:bg-white hover:text-slate-950 dark:hover:bg-gray-700 dark:hover:text-white font-bold py-2 px-4 rounded text-sm md:text-base dark:text-gray-200"
                aria-label="Configurar preferencias de cookies"
              >
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          ref={settingsRef}
          tabIndex={-1}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 id="cookie-settings-title" className="text-2xl font-bold text-slate-950 dark:text-white">Configuración de Cookies</h3>
                <button 
                  onClick={toggleSettings}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  aria-label="Cerrar configuración de cookies"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">Cookies esenciales</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
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

                <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">Cookies de rendimiento</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
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

                <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">Cookies funcionales</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
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

                <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">Cookies de marketing</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
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

                <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">Cookies de redes sociales</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  aria-label="Cancelar y cerrar configuración"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveSettings}
                  className="px-4 py-2 bg-slate-950 text-white rounded-md hover:bg-[#000050] dark:bg-blue-600 dark:hover:bg-blue-700"
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
