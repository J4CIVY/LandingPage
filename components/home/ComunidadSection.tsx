'use client';

import React from "react";

const ComunidadSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="text-green-400 dark:text-green-500">39 Miembros</span>, Miles de Kilómetros, <span className="text-red-600 dark:text-red-500">Una Sola Pasión</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 dark:text-green-500 mb-4">39</div>
            <h3 className="text-xl font-semibold mb-2">Miembros Activos</h3>
            <p className="text-gray-300 dark:text-gray-600">Una familia unida por la pasión de rodar juntos</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-red-600 dark:text-red-500 mb-4">150+</div>
            <h3 className="text-xl font-semibold mb-2">Seguidores</h3>
            <p className="text-gray-300 dark:text-gray-600">Una comunidad que crece cada día</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 dark:text-green-500 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Años de Historia</h3>
            <p className="text-gray-300 dark:text-gray-600">Creando recuerdos inolvidables desde 2022</p>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <p className="text-2xl md:text-3xl italic font-light leading-relaxed">
            "No es solo un club, es encontrar compañeros que comparten tu pasión. 
            Cada ruta es una aventura, cada parada una historia, cada miembro una familia."
          </p>
          <p className="mt-6 text-green-400 dark:text-green-500 font-semibold">
            - La Comunidad BSK
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComunidadSection;
