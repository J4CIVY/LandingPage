import React from "react";
import Header from "../components/shared/Header";
import Hero from "../components/shared/Hero";

const Home = ({ showMenu }) => {
  return (
    <div className={`py-2 px-4 transition-all duration-300 ${
      showMenu ? "ml-28" : "ml-0"
    }`}>
      <Header showMenu={showMenu} />
      <Hero />
      
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000031] mb-4">
            Bienvenido a Jeager Resto
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra exquisita gastronomía
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-[#000031] mb-2">
                Especialidad {item}
              </h3>
              <p className="text-gray-600">
                Descripción breve del plato o servicio destacado.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;