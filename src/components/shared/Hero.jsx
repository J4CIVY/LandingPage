const Hero = ({ showMenu }) => {  // Recibe la prop showMenu
  return (
    <section 
      className={`bg-[#ffffff] text-[#000031] py-16 px-4 md:px-20 transition-all duration-300 ${
        showMenu ? "ml-28" : "ml-0"
      }`}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">BSK Motorcycle Team</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Hermandad, Espíritu y Respeto en cada kilómetro. Únete a una comunidad de motociclistas que viven la ruta con pasión y camaradería.
        </p>
        <a
          href="#membresias"
          className="inline-block bg-white text-[#000031] font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
        >
          Explora nuestras membresías
        </a>
      </div>
    </section>
  );
};

export default Hero;