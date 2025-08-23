'use client';

import React from "react";

const ComunidadSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-slate-950 dark:bg-slate-white text-white dark:text-slate-950">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="text-green-400">39 Miembros</span>, <span className="text-slate-950 dark:text-white">Miles de Kilómetros,</span>, <span className="text-red-600">Una Sola Pasión</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-4">39</div>
            <h3 className="text-xl font-semibold mb-2">Miembros Activos</h3>
            <p className="text-gray-300">Una familia unida por la pasión de rodar juntos</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-red-600 mb-4">150+</div>
            <h3 className="text-xl font-semibold mb-2">Seguidores</h3>
            <p className="text-gray-300">Una comunidad que crece cada día</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Años de Historia</h3>
            <p className="text-gray-300">Creando recuerdos inolvidables desde 2022</p>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl italic font-light leading-relaxed">
            "No es solo un club, es encontrar compañeros que comparten tu pasión. 
            Cada ruta es una aventura, cada parada una historia, cada miembro una familia."
          </blockquote>
          <cite className="block mt-6 text-green-400 font-semibold">- La Comunidad BSK</cite>
        </div>
      </div>
    </section>
  );
};

export default ComunidadSection;
