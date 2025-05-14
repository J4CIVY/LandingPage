import React from 'react';
import { FaMotorcycle, FaHandsHelping, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  return (
    <main className="min-h-screen bg-primary text-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            Sobre <span className="text-accent">BSK Motorcycle Team</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Más que un club, una familia sobre ruedas. Conoce nuestra historia, valores y lo que nos hace únicos.
          </p>
        </div>
      </section>

      {/* Historia del Club */}
      <section className="py-16 px-4 bg-primary-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Nuestra <span className="text-accent">Historia</span>
          </h2>
          
          <article className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Los Comienzos</h3>
              <p className="mb-6">
                BSK Motorcycle Team nació en 2010 de la pasión compartida por un grupo de amigos amantes de las motos. 
                Lo que comenzó como salidas casuales los fines de semana, pronto se convirtió en un movimiento organizado.
              </p>
              <p className="mb-6">
                En 2012, oficializamos nuestro club con el objetivo de promover el motociclismo responsable y crear 
                una comunidad donde la camaradería y el respeto fueran los pilares fundamentales.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden h-64 md:h-96">
              {/* Placeholder para imagen histórica */}
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <FaMotorcycle className="text-6xl text-accent" />
              </div>
            </div>
          </article>

          <article className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-4">Crecimiento y Reconocimiento</h3>
              <p className="mb-6">
                Para 2015, BSK ya contaba con más de 50 miembros activos y habíamos organizado nuestro primer evento 
                benéfico, recaudando fondos para causas locales. Este fue el primero de muchos eventos que marcarían 
                nuestro compromiso con la comunidad.
              </p>
              <p>
                Hoy, con más de 200 miembros en toda la región, seguimos creciendo manteniendo nuestros valores 
                originales: pasión por las motos, respeto por la vida y compromiso con nuestra comunidad.
              </p>
            </div>
            <div className="order-2 md:order-1 bg-gray-800 rounded-lg overflow-hidden h-64 md:h-96">
              {/* Placeholder para imagen de crecimiento */}
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <FaHandsHelping className="text-6xl text-accent" />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Pilares del Club */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Nuestros <span className="text-accent">Pilares</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Misión */}
            <article className="bg-primary-dark p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaMotorcycle />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Misión</h3>
              <p>
                Promover el motociclismo seguro y responsable, fomentando la camaradería entre nuestros miembros 
                y contribuyendo positivamente a nuestra comunidad a través de eventos benéficos y actividades sociales.
              </p>
            </article>

            {/* Visión */}
            <article className="bg-primary-dark p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaShieldAlt />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Visión</h3>
              <p>
                Ser reconocidos como el club de motociclistas más respetado de la región, conocido por nuestros 
                altos estándares éticos, nuestro compromiso con la seguridad vial y nuestro espíritu de comunidad.
              </p>
            </article>

            {/* Valores */}
            <article className="bg-primary-dark p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaHandsHelping />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Valores</h3>
              <ul className="space-y-2">
                <li>• Respeto por la vida y las normas viales</li>
                <li>• Camaradería y apoyo mutuo</li>
                <li>• Responsabilidad social</li>
                <li>• Pasión por el motociclismo</li>
                <li>• Integridad en todas nuestras acciones</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Filosofía y Lema */}
      <section className="py-20 px-4 bg-accent text-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Nuestra <span className="text-secondary">Filosofía</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Hermandad</h3>
              <p>
                En BSK no somos solo compañeros de ruta, somos familia. Apoyamos a nuestros miembros en las buenas 
                y en las malas, dentro y fuera de la carretera.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Espíritu</h3>
              <p>
                Vivimos con pasión y determinación. Cada viaje es una aventura y cada miembro aporta su energía única 
                al grupo.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Respeto</h3>
              <p>
                Respeto por la vida, por las normas, por nuestros compañeros y por todos los usuarios de la vía. 
                Este es nuestro valor fundamental.
              </p>
            </div>
          </div>

          <blockquote className="text-2xl md:text-3xl italic font-semibold">
            "En la carretera como en la vida: juntos, con pasión y respeto."
          </blockquote>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Voces de <span className="text-accent">BSK</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-white text-primary p-6 rounded-lg shadow-lg">
              <p className="italic mb-4">
                "Unirme a BSK fue la mejor decisión que pude tomar. No solo he hecho amigos para toda la vida, 
                sino que he aprendido a ser un motociclista más seguro y responsable."
              </p>
              <p className="font-semibold">- Carlos, miembro desde 2015</p>
            </article>

            <article className="bg-white text-primary p-6 rounded-lg shadow-lg">
              <p className="italic mb-4">
                "Los eventos benéficos que organizamos me llenan de orgullo. Demostramos que los motociclistas 
                podemos ser una fuerza positiva en la comunidad."
              </p>
              <p className="font-semibold">- Ana, miembro desde 2018</p>
            </article>

            <article className="bg-white text-primary p-6 rounded-lg shadow-lg md:col-span-2 lg:col-span-1">
              <p className="italic mb-4">
                "Como mujer motociclista, encontré en BSK un espacio de respeto e igualdad. Aquí lo único que 
                importa es la pasión por las motos."
              </p>
              <p className="font-semibold">- Laura, miembro desde 2020</p>
            </article>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-16 px-4 bg-primary-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Nuestros <span className="text-accent">Momentos</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="aspect-square bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                <FaMotorcycle className="text-4xl text-accent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para unirte a la <span className="text-accent">familia BSK</span>?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubre la emoción de formar parte de un club donde la pasión por las motos va de la mano con la amistad y el respeto.
          </p>
          <button 
            className="bg-accent text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-dark transition-colors"
            aria-label="Únete a BSK Motorcycle Team"
          >
            Únete a BSK Motorcycle Team
          </button>
        </div>
      </section>
    </main>
  );
};

export default About;