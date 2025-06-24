import React from "react";

const HeroSection = () => (
  <section className="relative flex items-center justify-center bg-[#000031] overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
    <div className="absolute inset-0 w-full h-full">
      <div className="w-full h-full flex items-center justify-center">
        <img
          src="/Banner_Home_Motoclub_BSK_Motorcycle_Team.webp"
          alt="BSK Motorcycle Team"
          className="w-full h-auto max-w-none"
          style={{
            aspectRatio: '19/9',
            objectFit: 'cover',
            minHeight: '100%',
            minWidth: '100%'
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>

    <div className="relative z-10 text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
        <span className="text-[#00FF99]">BSK</span> MOTORCYCLE TEAM
      </h1>
      <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
        Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
      </p>
      <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
        ÚNETE AL CLUB
      </button>
    </div>
  </section>
);

export default HeroSection;