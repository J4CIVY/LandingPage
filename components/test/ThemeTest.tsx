'use client';

import React from 'react';
import { useTheme } from 'next-themes';

const ThemeTest: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 bg-white dark:bg-slate-950 text-slate-950 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎨 Prueba de Tema BSK</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-4">Tema actual: <strong>{theme}</strong></p>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setTheme('light')}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold"
          >
            ☀️ Modo Claro
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
          >
            🌙 Modo Oscuro
          </button>
          <button 
            onClick={() => setTheme('system')}
            className="px-4 py-2 bg-green-400 hover:bg-green-500 text-black rounded-lg font-semibold"
          >
            💻 Sistema
          </button>
        </div>
      </div>

      {/* Test del componente HermandadSection */}
      <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Prueba HermandadSection
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 dark:text-green-400 mb-2">39</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Miembros Activos</h3>
            <p className="text-gray-600 dark:text-gray-300">Una familia unida por la pasión</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 dark:text-red-600 mb-2">150+</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Seguidores</h3>
            <p className="text-gray-600 dark:text-gray-300">Una comunidad que crece</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 dark:text-green-400 mb-2">3</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Años de Historia</h3>
            <p className="text-gray-600 dark:text-gray-300">Creando recuerdos desde 2022</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xl italic text-gray-600 dark:text-gray-300 mb-4">
            "No es solo un club, es encontrar compañeros que comparten tu pasión."
          </p>
          <p className="text-green-400 dark:text-green-400 font-semibold">
            - La Comunidad BSK
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
