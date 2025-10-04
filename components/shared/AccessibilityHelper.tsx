'use client';

import React, { useEffect, useState } from 'react';

/**
 * Accessibility Helper Component
 * Provides keyboard shortcuts, screen reader announcements, and focus management
 */
const AccessibilityHelper: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Listen for route changes to announce them
    const handleRouteChange = () => {
      const pageTitle = document.title;
      setAnnouncement(`Navegado a ${pageTitle}`);
      setTimeout(() => setAnnouncement(''), 3000);
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + H: Go to home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
        setAnnouncement('Navegando a la página de inicio');
      }
      
      // Alt + M: Go to memberships
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        window.location.href = '/memberships';
        setAnnouncement('Navegando a membresías');
      }
      
      // Alt + E: Go to events
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        window.location.href = '/events';
        setAnnouncement('Navegando a eventos');
      }
      
      // Alt + S: Focus on search
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          setAnnouncement('Enfocando en búsqueda');
        }
      }
      
      // Escape: Close any open modal or menu
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        openModals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label*="Cerrar"]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Keyboard shortcuts help panel */}
      <details className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm">
        <summary className="px-4 py-3 cursor-pointer font-semibold text-sm text-slate-950 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-t-lg focus-enhanced">
          ⌨️ Atajos de teclado
        </summary>
        <div className="px-4 py-3 text-sm space-y-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Alt + H</kbd>
            <span className="text-gray-700 dark:text-gray-300">Ir a inicio</span>
          </div>
          <div className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Alt + M</kbd>
            <span className="text-gray-700 dark:text-gray-300">Membresías</span>
          </div>
          <div className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Alt + E</kbd>
            <span className="text-gray-700 dark:text-gray-300">Eventos</span>
          </div>
          <div className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Alt + S</kbd>
            <span className="text-gray-700 dark:text-gray-300">Buscar</span>
          </div>
          <div className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Esc</kbd>
            <span className="text-gray-700 dark:text-gray-300">Cerrar modal</span>
          </div>
        </div>
      </details>
    </>
  );
};

export default AccessibilityHelper;
