import React from "react";

const HeroSection = () => (
  <section className="relative h-screen flex items-center justify-center bg-[#000031] overflow-hidden">
    <div className="absolute inset-0 w-full h-full">
      <img
        src="/Banner_Home_Motoclub_BSK_Motorcycle_Team.webp"
        alt="BSK Motorcycle Team"
        className="w-full h-full object-cover"
        style={{
          aspectRatio: '16/9',
          objectPosition: 'center center'
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>

    <div className="relative z-10 text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
        <span className="text-[#00FF99]">BSK</span> MOTORCYCLE TEAM
      </h1>
      <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
        Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
      </p>
      <button 
      onClick={() => navigate('/membership')}
      className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
        ÚNETE AL CLUB
      </button>
    </div>
  </section>
);

export default HeroSection;