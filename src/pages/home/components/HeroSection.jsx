import React from "react";

const HeroSection = () => {
  // Calculamos la altura del header (py-1 = 0.25rem, pero ajusta según necesidades)
  const headerHeight = '4rem'; // Ajusta este valor según la altura real de tu header

  return (
    <div 
      className="relative w-full bg-[#000031]"
      style={{
        paddingTop: headerHeight, // Empuja el contenido hacia abajo
        aspectRatio: '19/9'       // Mantiene la relación deseada
      }}
    >
      {/* Contenedor de imagen con overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/Banner_Home_Motoclub_BSK_Motorcycle_Team.webp"
          alt="BSK Motorcycle Team"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 animate-fade-in">
          <span className="text-[#00FF99]">BSK</span> MOTORCYCLE TEAM
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto">
          Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
        </p>
        <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition duration-300 transform hover:scale-105">
          ÚNETE AL CLUB
        </button>
      </div>
    </div>
  );
};

export default HeroSection;