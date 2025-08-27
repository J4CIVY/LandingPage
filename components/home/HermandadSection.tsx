'use client';

import React from "react";
import { AnimatedHeading, AnimatedParagraph, AnimatedText } from "@/components/animations/AnimatedText";

const HermandadSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedHeading 
          level={2}
          animationType="slideUp"
          delay={100}
          className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-white"
        >
          <span className="text-green-400 dark:text-green-400">39 Miembros</span>, <span className="text-green-400 dark:text-white">cientos de Kilómetros</span>, <span className="text-red-600 dark:text-red-600">Una Sola Pasión</span>
        </AnimatedHeading>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <AnimatedText
            animationType="scaleIn"
            delay={300}
            className="text-center"
          >
            <div className="text-5xl font-bold text-green-400 dark:text-green-400 mb-4">39</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros Activos</h3>
            <p className="text-gray-600 dark:text-gray-300">Una familia unida por la pasión de rodar juntos</p>
          </AnimatedText>
          
          <AnimatedText
            animationType="scaleIn"
            delay={450}
            className="text-center"
          >
            <div className="text-5xl font-bold text-red-600 dark:text-red-600 mb-4">150+</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Seguidores</h3>
            <p className="text-gray-600 dark:text-gray-300">Una comunidad que crece cada día</p>
          </AnimatedText>
          
          <AnimatedText
            animationType="scaleIn"
            delay={600}
            className="text-center"
          >
            <div className="text-5xl font-bold text-green-400 dark:text-green-400 mb-4">3</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Años de Historia</h3>
            <p className="text-gray-600 dark:text-gray-300">Creando recuerdos inolvidables desde 2022</p>
          </AnimatedText>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <AnimatedParagraph
            animationType="fadeIn"
            delay={800}
            className="text-2xl md:text-3xl italic font-light text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            "No es solo un club, es encontrar compañeros que comparten tu pasión. 
            Cada ruta es una aventura, cada parada una historia, cada miembro una familia."
          </AnimatedParagraph>
          <AnimatedParagraph
            animationType="fadeIn"
            delay={1000}
            className="mt-6 text-green-400 dark:text-green-400 font-semibold"
          >
            - La Comunidad BSK
          </AnimatedParagraph>
        </div>
      </div>
    </section>
  );
};

export default HermandadSection;
