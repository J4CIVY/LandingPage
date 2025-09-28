import React from 'react';
import { FaMotorcycle, FaHandsHelping, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Sobre Nosotros - Historia y Valores",
  description: "Conoce la historia, misión, visión y valores de BSK Motorcycle Team. Somos más que un motoclub, somos una familia apasionada por el motociclismo en Colombia desde 2022.",
  keywords: ["historia BSK Motorcycle Team", "valores motoclub", "misión BSK", "visión motociclismo", "fundación BSK 2022", "comunidad motera"],
  openGraph: {
    title: "Sobre Nosotros - BSK Motorcycle Team",
    description: "Conoce la historia, misión, visión y valores de BSK Motorcycle Team. Somos más que un motoclub, somos una familia apasionada por el motociclismo en Colombia.",
    url: "https://bskmt.com/about",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_About_Team_Photo.jpg",
        width: 1200,
        height: 630,
        alt: "Equipo BSK Motorcycle Team - Historia y valores",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros - BSK Motorcycle Team",
    description: "Conoce la historia, misión, visión y valores de BSK Motorcycle Team. Somos más que un motoclub, somos una familia apasionada por el motociclismo.",
  },
  alternates: {
    canonical: "https://bskmt.com/about",
  },
};

/**
 * About component displays information about BSK Motorcycle Team, including its history, mission, vision, and values.
 * @returns {JSX.Element}
 */
const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-950 dark:text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center text-slate-950 dark:text-white">
            Sobre <span className="text-accent">BSK Motorcycle Team</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
            Donde la comunidad se vive sobre dos ruedas. Conoce nuestra historia, valores y lo que nos hace una familia unida por la pasión, el espíritu aventurero y el respeto mutuo.
          </p>
        </div>
      </section>

      {/* Club History */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Nuestra <span className="text-green-600 dark:text-green-600">Historia</span>
          </h2>

          <article className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">
                Los Comienzos
              </h3>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                BSK Motorcycle Team nació en 2022, fruto de la pasión de un pequeño grupo de amigos que compartían un mismo lenguaje: el rugir de sus motocicletas. Lo que empezó como simples rodadas de fin de semana por las montañas que rodean Bogotá, pronto se convirtió en un movimiento organizado que atraía a más y más riders con un mismo deseo: vivir la aventura sobre dos ruedas de forma responsable, libre y en comunidad.
              </p>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Ese mismo año, decidimos dar un paso más grande. Oficializamos nuestro club bajo el nombre de BSK Motorcycle Team, con un propósito claro: construir una hermandad de motociclistas que combinara fraternidad, disciplina y respeto por la vida y la carretera.
              </p>
            </div>
            <div className="bg-gray-800 dark:bg-slate-700 rounded-lg overflow-hidden h-64 md:h-96 flex items-center justify-center">
              {/* Placeholder for historical image */}
              <FaMotorcycle className="text-6xl text-accent" aria-label="Motocicleta" />
            </div>
          </article>

          <article className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">
                Crecimiento y Reconocimiento
              </h3>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                El entusiasmo y la energía nos impulsaron rápido. En el primer año ya éramos 17 miembros activos y comenzamos a organizar rutas y experiencias inolvidables:
              </p>  
              <p>
                <ol>
                  <li>Tour Andino</li>
                  <li>Tour de Los Llanos</li>
                  <li>Road To Girardot</li>
                  <li>We Come And Go La Calera</li>
                  <li>Direct To F2R</li>
                </ol>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                No solo rodábamos: también aportamos a la sociedad con eventos benéficos para recaudar fondos destinados a causas locales, y realizamos nuestras primeras capacitaciones en seguridad vial y técnicas de manejo, sentando las bases de lo que más adelante serían nuestros programas de formación para motociclistas.
              </p>
            </div>
            <div className="order-2 md:order-1 bg-gray-800 dark:bg-slate-700 rounded-lg overflow-hidden h-64 md:h-96 flex items-center justify-center">
              {/* Placeholder for growth image */}
              <FaHandsHelping className="text-6xl text-accent" aria-label="Manos ayudando" />
            </div>
          </article>

          <article className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">
                BSK Motorcycle Team Hoy
              </h3>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Hoy, BSK Motorcycle Team cuenta con 39 miembros activos en Bogotá y Cundinamarca, además de una comunidad de más de 150 seguidores que nos acompañan, nos apoyan y sueñan con nosotros cada nueva ruta.
              </p>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Pero lo más importante es que seguimos creciendo sin perder nuestra esencia: la pasión por las motos, el respeto por la vida y el compromiso con nuestra comunidad.              </p>
            </div>
            <div className="bg-gray-800 dark:bg-slate-700 rounded-lg overflow-hidden h-64 md:h-96 flex items-center justify-center">
              {/* Placeholder for historical image */}
              <FaMotorcycle className="text-6xl text-accent" aria-label="Motocicleta" />
            </div>
          </article>

          <article className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">
                Más que una marca, un club
              </h3>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Lo que comenzó como un sueño de amigos se ha convertido en una marca que trasciende el motociclismo tradicional. Hoy en día, BSK Motorcycle Team es: 
              </p>
              <p>
                <ol>
                  <li>Un motoclub sólido que ofrece experiencias únicas a sus miembros.</li>
                  <li>Un centro de encuentro de motociclistas en Colombia, abierto a quienes comparten nuestra pasión.</li>
                  <li>Una empresa legalmente constituida (Organización Motear SAS) que ofrece tours, cursos, capacitaciones y una tienda oficial, donde vendemos nuestra propia marca y los mejores productos de las firmas más prestigiosas del mundo del motociclismo.</li>
                </ol>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                No solo rodábamos: también aportamos a la sociedad con eventos benéficos para recaudar fondos destinados a causas locales, y realizamos nuestras primeras capacitaciones en seguridad vial y técnicas de manejo, sentando las bases de lo que más adelante serían nuestros programas de formación para motociclistas.
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
            Nuestros <span className="text-red-600 dark:text-red-600">Pilares</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <article className="bg-gray-100 dark:bg-slate-900 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaMotorcycle aria-label="Icono de motocicleta" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Misión</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ser la familia que cada motero necesita. Promovemos el motociclismo seguro y responsable,
                fomentando la comunidad entre nuestros miembros y contribuyendo positivamente a nuestra
                comunidad a través de eventos benéficos y aventuras que crean recuerdos para toda la vida.
              </p>
            </article>

            {/* Vision */}
            <article className="bg-gray-100 dark:bg-slate-900 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaShieldAlt aria-label="Icono de escudo" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Visión</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ser reconocidos como la comunidad de motociclistas más respetada de Colombia,
                conocida por nuestros valores de comunidad, espíritu aventurero y respeto mutuo.
                Donde cada ruta se convierte en una aventura y cada miembro encuentra su segunda familia.
              </p>
            </article>

            {/* Values */}
            <article className="bg-gray-100 dark:bg-slate-900 p-8 rounded-lg shadow-lg">
              <div className="text-accent text-4xl mb-4">
                <FaHandsHelping aria-label="Icono de manos ayudando" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-white">Valores</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Comunidad: Una familia unida sobre ruedas</li>
                <li>• Espíritu aventurero: Cada ruta es una nueva historia</li>
                <li>• Respeto mutuo: Cuidamos de cada miembro</li>
                <li>• Pasión por el motociclismo responsable</li>
                <li>• Integridad en todas nuestras aventuras</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Philosophy and Motto */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-950 dark:text-white">
            Nuestra <span className="text-green-600 dark:text-green-600">Filosofía</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Comunidad</h3>
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
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Voces de <span className="text-red-600 dark:text-red-600">BSK</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-gray-100 dark:bg-slate-900 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                "Unirme a BSK fue la mejor decisión que pude tomar. No solo he hecho amigos para toda la vida,
                sino que he aprendido a ser un motociclista más seguro y responsable."
              </p>
              <p className="font-semibold text-slate-950 dark:text-white">- Carlos, miembro desde 2022</p>
            </article>

            <article className="bg-gray-100 dark:bg-slate-900 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                "Los eventos benéficos que organizamos me llenan de orgullo. Demostramos que los motociclistas
                podemos ser una fuerza positiva en la comunidad."
              </p>
              <p className="font-semibold text-slate-950 dark:text-white">- Ana, miembro desde 2022</p>
            </article>

            <article className="bg-gray-100 dark:bg-slate-900 text-slate-950 dark:text-white p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 md:col-span-2 lg:col-span-1">
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
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-950 dark:text-white">
            Nuestros <span className="text-green-600 dark:text-green-600">Momentos</span>
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
            className="bg-accent text-slate-950 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-dark dark:bg-green-500 dark:hover:bg-green-600"
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
