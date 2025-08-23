'use client';

import React from 'react';
import { FaMotorcycle, FaHandsHelping, FaShieldAlt } from 'react-icons/fa';
import SEOComponent from '@/components/home/SEOComponent';
import Image from 'next/image';

/**
 * About component displays information about BSK Motorcycle Team, including its history, mission, vision, and values.
 * @returns {JSX.Element}
 */
const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-950 dark:text-white">
      <SEOComponent
        title="Sobre Nosotros - BSK Motorcycle Team"
        description="Conoce la historia, misión, visión y valores de BSK Motorcycle Team. Somos más que un motoclub, somos una familia apasionada por el motociclismo en Colombia."
      />
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center text-slate-950 dark:text-white">
            Sobre <span className="text-accent">BSK Motorcycle Team</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
            Más que un club, una familia sobre ruedas. Conoce nuestra historia, valores y lo que nos hace únicos.
          </p>
        </div>
      </section>

      {/* Club History */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Nuestra <span className="text-accent">Historia</span>
          </h2>
          
          <article className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Los Comienzos</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                BSK Motorcycle Team nació en 2022 de la pasión compartida por un grupo de amigos amantes de las motos. 
                Lo que comenzó como salidas casuales los fines de semana, pronto se convirtió en un movimiento organizado.
              </p>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                En 2022, oficializamos nuestro club con el objetivo de promover el motociclismo responsable y crear 
                una comunidad donde la camaradería y el respeto fueran los pilares fundamentales.
              </p>
            </div>
            <div className="bg-gray-800 dark:bg-slate-700 rounded-lg overflow-hidden h-64 md:h-96 flex items-center justify-center">
              {/* Placeholder for historical image */}
              <FaMotorcycle className="text-6xl text-accent" aria-label="Motocicleta" />
            </div>
          </article>

          <article className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Crecimiento y Reconocimiento</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Al finalizar el primer año, BSK ya contaba con 17 miembros activos y habíamos organizado varios eventos 
                entre ellos el Tour Andino, Tour De Los LLanos, Tour Navideño, Road To Villeta, Road To Guamal, 
                Road To Girardot, We Come And Go Tocaima, We Come And Go Choachi, We Come And Go La Calera, Direct To F2R, 
                adicionalmente realizamos algunos eventos benéficos, recaudando fondos para causas locales y realizamos 
                algunas capacitaciones en seguridad vial y y tecnicas de manejo. Estos fueron los primeros de muchos eventos 
                que marcarían nuestro compromiso con la comunidad.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Hoy, contamos con exactamente 39 miembros activos en Bogotá y cundinamarca, y algo mas de 150 seguidores y 
                seguimos creciendo manteniendo nuestros valores originales: pasión por las motos, respeto por la vida y 
                compromiso con nuestra comunidad.
              </p>
            </div>
            <div className="order-2 md:order-1 bg-gray-800 dark:bg-slate-700 rounded-lg overflow-hidden h-64 md:h-96 flex items-center justify-center">
              {/* Placeholder for growth image */}
              <FaHandsHelping className="text-6xl text-accent" aria-label="Manos ayudando" />
            </div>
          </article>
        </div>
      </section>

      {/* Club Pillars */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Nuestros <span className="text-accent">Pilares</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <article className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaMotorcycle aria-label="Icono de motocicleta" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Misión</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Promover el motociclismo seguro y responsable, fomentando la camaradería entre nuestros miembros 
                y contribuyendo positivamente a nuestra comunidad a través de eventos benéficos y actividades sociales.
              </p>
            </article>

            {/* Vision */}
            <article className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaShieldAlt aria-label="Icono de escudo" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Visión</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ser reconocidos como el club de motociclistas más respetado de Bogotá, Colombia, Amedrica y el mundo, 
                conocido por nuestros altos estándares éticos, nuestro compromiso con la seguridad vial y nuestro 
                espíritu de comunidad.
              </p>
            </article>

            {/* Values */}
            <article className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaHandsHelping aria-label="Icono de manos ayudando" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Valores</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
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

      {/* Philosophy and Motto */}
      <section className="py-20 px-4 bg-accent text-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Nuestra <span className="text-white dark:text-slate-950">Filosofía</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Hermandad</h3>
              <p>
                En BSK Motorcycle Team no somos solo compañeros de ruta, somos familia. Apoyamos a nuestros miembros 
                en las buenas y en las malas, dentro y fuera de la carretera.
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

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Voces de <span className="text-accent">BSK</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-white dark:bg-slate-800 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                "Unirme a BSK fue la mejor decisión que pude tomar. No solo he hecho amigos para toda la vida, 
                sino que he aprendido a ser un motociclista más seguro y responsable."
              </p>
              <p className="font-semibold text-slate-950 dark:text-white">- Carlos, miembro desde 2022</p>
            </article>

            <article className="bg-white dark:bg-slate-800 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                "Los eventos benéficos que organizamos me llenan de orgullo. Demostramos que los motociclistas 
                podemos ser una fuerza positiva en la comunidad."
              </p>
              <p className="font-semibold text-slate-950 dark:text-white">- Ana, miembro desde 2022</p>
            </article>

            <article className="bg-white dark:bg-slate-800 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 md:col-span-2 lg:col-span-1">
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                "Como mujer motociclista, encontré en BSK un espacio de respeto e igualdad. Aquí lo único que 
                importa es la pasión por las motos."
              </p>
              <p className="font-semibold text-slate-950 dark:text-white">- Laura, miembro desde 2024</p>
            </article>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Nuestros <span className="text-accent">Momentos</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="aspect-square bg-gray-700 dark:bg-slate-600 rounded-lg overflow-hidden flex items-center justify-center">
                {/* Added alt attribute for accessibility */}
                <FaMotorcycle className="text-4xl text-accent" aria-label={`Imagen de motocicleta ${item}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-950 dark:text-white">
            ¿Listo para unirte a la <span className="text-accent">familia BSK</span>?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            Descubre la emoción de formar parte de un club donde la pasión por las motos va de la mano con la amistad y el respeto.
          </p>
          <button 
            className="bg-accent text-slate-950 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-dark transition-colors"
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
