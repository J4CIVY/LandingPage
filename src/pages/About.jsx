import React from "react";
import Header from "../components/shared/Header";

const About = ({ showMenu }) => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#000031] text-white py-20 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">BSK Motorcycle Team</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Hermandad sobre ruedas, pasión en cada kilómetro
          </p>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#000031] mb-4">Nuestra Historia</h2>
          <div className="w-24 h-1 bg-[#00ff99] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Fundado en 2010, BSK Motorcycle Team nació como un grupo de amigos apasionados por el motociclismo.
            Hoy somos una familia de más de 150 miembros que comparten la misma filosofía de vida sobre dos ruedas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/bsk-team-riding.jpg" 
              alt="BSK Team en ruta"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#000031] mb-4">¿Quiénes Somos?</h3>
            <p className="text-gray-700 mb-6">
              Somos una comunidad de motociclistas que valoramos la camaradería, el respeto por la carretera
              y la búsqueda constante de nuevas aventuras. No somos un simple club, somos una hermandad.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-[#00ff99] mr-2">✓</span>
                <span>+150 miembros activos</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#00ff99] mr-2">✓</span>
                <span>Organizamos 2 eventos mensuales</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#00ff99] mr-2">✓</span>
                <span>10 años de trayectoria</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="bg-gray-50 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#000031] text-center mb-16">Nuestros Pilares</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Misión */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#00ff99] text-4xl mb-4">🏍️</div>
              <h3 className="text-xl font-bold text-[#000031] mb-3">Misión</h3>
              <p className="text-gray-700">
                Promover el motociclismo seguro y responsable, creando lazos de amistad entre nuestros miembros
                y contribuyendo positivamente a la comunidad motera.
              </p>
            </div>
            
            {/* Visión */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#00ff99] text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-bold text-[#000031] mb-3">Visión</h3>
              <p className="text-gray-700">
                Ser el club de motociclistas más reconocido a nivel nacional por nuestra filosofía de hermandad,
                eventos de calidad y compromiso con la seguridad vial.
              </p>
            </div>
            
            {/* Valores */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#00ff99] text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-[#000031] mb-3">Valores</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#00ff99] mr-2">•</span>
                  <span>Respeto por la vida y la carretera</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00ff99] mr-2">•</span>
                  <span>Lealtad entre miembros</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00ff99] mr-2">•</span>
                  <span>Pasión por el motociclismo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000031] mb-4">Nuestra Filosofía</h2>
          <div className="w-24 h-1 bg-[#00ff99] mx-auto"></div>
        </div>
        
        <div className="bg-[#000031] text-white rounded-xl p-8 md:p-12">
          <blockquote className="text-xl md:text-2xl italic text-center mb-6">
            "No montamos para escapar de la vida, montamos para que la vida no se nos escape"
          </blockquote>
          <p className="text-center text-[#00ff99] font-semibold">
            - Lema del BSK Motorcycle Team
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#00ff99] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#000031] mb-6">¿Quieres unirte a nuestra hermandad?</h2>
          <p className="text-xl text-[#000031] mb-8">
            Participa en nuestros próximos eventos o hazte miembro oficial
          </p>
          <button className="bg-[#000031] text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition">
            Contáctanos
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;