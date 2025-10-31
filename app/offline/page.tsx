/**
 * Offline Fallback Page
 * Displayed when the user is offline and tries to access a page
 * Part of PWA functionality
 */

'use client';

import Link from 'next/link';
import { FaWifi, FaHome } from 'react-icons/fa';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 relative">
          {/* Animated Offline Icon */}
          <div className="inline-block relative">
            <FaWifi className="text-6xl text-slate-300 dark:text-slate-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-1 bg-red-500 transform rotate-45"></div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Sin conexión
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Parece que no tienes conexión a Internet. Por favor, verifica tu conexión e intenta de nuevo.
        </p>

        <div className="space-y-4">
          {/* Retry Button */}
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Intentar de nuevo
          </button>

          {/* Home Button */}
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <FaHome />
            <span>Ir al inicio</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
            ¿Qué puedes hacer?
          </h2>
          <ul className="text-left text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Verifica tu conexión WiFi o datos móviles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Activa el modo avión y desactívalo después de unos segundos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Reinicia tu router o módem</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Algunas páginas visitadas recientemente pueden estar disponibles sin conexión</span>
            </li>
          </ul>
        </div>

        {/* Online Status Indicator */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-700 dark:text-red-400">
              Sin conexión a Internet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
