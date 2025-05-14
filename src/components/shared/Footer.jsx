import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#000031] text-gray-500">
      {/* Primera Sección - Logo y Lema */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
          <img 
            src="/Logos_Footer_Motoclub_BSK_Motorcycle_Team.webp" 
            alt="Logo BSK Motorcycle Team" 
            className="h-44 w-auto"
          />
          <p className="text-base font-light italic text-center">Hermandad, Espíritu y Respeto</p>
        </div>
      </section>

      {/* Segunda Sección - Apoyos y Vigilancia */}
      <section className="py-8 px-4 border-t border-[#000031]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Apoyo */}
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Con El Apoyo De</h2>
              <img 
                src="/Logo_Innpulsa_Colombia_SNF.webp" 
                alt="Logo Innpulsa Colombia" 
                className="h-12 w-auto"
              />
            </div>

            {/* Vigilancia */}
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Vigilado Por</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src="/Logo_Supersociedades_SNF.webp" 
                  alt="Logo Superintendencia de Sociedades" 
                  className="h-12 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tercera Sección - Redes Sociales y Menú Legal */}
      <section className="py-8 px-4 border-t border-[#000031]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Redes Sociales */}
            <div className="flex flex-col items-center md:items-start space-y-3">
              <p className="text-sm font-medium">Síguenos</p>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com/bskmotorcycleteam" 
                  aria-label="Facebook BSK Motorcycle Team"
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <FaFacebook size={20} />
                </a>
                <a 
                  href="https://instagram.com/bskmotorcycleteam" 
                  aria-label="Instagram BSK Motorcycle Team"
                  className="text-white hover:text-pink-500 transition-colors"
                >
                  <FaInstagram size={20} />
                </a>
                <a 
                  href="https://twitter.com/bskmotorcycleteam" 
                  aria-label="Twitter BSK Motorcycle Team"
                  className="text-white hover:text-blue-300 transition-colors"
                >
                  <FaTwitter size={20} />
                </a>
                <a 
                  href="https://youtube.com/bskmotorcycleteam" 
                  aria-label="YouTube BSK Motorcycle Team"
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>

            {/* Menú Legal */}
            <nav aria-label="Menú legal">
              <ul className="flex flex-wrap justify-center gap-4 md:gap-6">
                <li>
                  <a href="/condiciones" className="text-sm hover:underline">Condiciones</a>
                </li>
                <li>
                  <a href="/privacidad" className="text-sm hover:underline">Privacidad</a>
                </li>
                <li>
                  <a href="/mapa-web" className="text-sm hover:underline">Mapa web</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Cuarta Sección - Copyright */}
      <section className="py-6 px-4 border-t border-[#000031]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-xs md:text-sm space-y-2">
            <p>
              Copyright © 2022 - {currentYear} Organización Motear S.A.S., OMSAS. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;