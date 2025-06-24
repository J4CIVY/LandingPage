import React from "react";

const HeroSection = () => (
  <section 
    className="relative w-full flex items-center justify-center bg-[#000031] overflow-hidden"
    style={{
      aspectRatio: '19/10', // Forzar relación de aspecto 19/9
    }}
  >
    <div className="absolute inset-0 w-full h-full">
      <img
        src="/Banner_Home_Motoclub_BSK_Motorcycle_Team.webp"
        alt="BSK Motorcycle Team"
        className="w-full h-full object-cover" // Cubrir todo el espacio
        style={{
          objectPosition: 'center center', // Centrar la imagen
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>

    <div className="relative z-10 text-center px-4">
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
  </section>
);

export default HeroSection;