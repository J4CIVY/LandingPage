import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { footerImages } from '@/data/images';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-gray-500">
      {/* First Section - Logo and Motto */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
          <picture>
            <source srcSet={footerImages.logoClub.avif} type="image/avif" />
            <source srcSet={footerImages.logoClub.webp} type="image/webp" />
            <img
              src={footerImages.logoClub.jpg}
              alt="Logo BSK Motorcycle Team"
              className="h-44 w-auto"
              width="854"
              height="480"
              loading="lazy"
            />
          </picture>
          <p className="text-base font-light italic text-center">Hermandad, Espíritu y Respeto</p>
        </div>
      </section>

      {/* Second Section - Support and Oversight */}
      <section className="py-8 px-4 border-t border-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Support - Innpulsa Logo */}
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Con El Apoyo De</h2>
              <picture>
                <source srcSet={footerImages.logoInnpulsa.avif} type="image/avif" />
                <source srcSet={footerImages.logoInnpulsa.webp} type="image/webp" />
                <img
                  src={footerImages.logoInnpulsa.png}
                  alt="Logo Innpulsa Colombia"
                  className="h-12 w-auto"
                  width="250"
                  height="100"
                  loading="lazy"
                />
              </picture>
            </div>

            {/* Oversight - Superintendence Logo */}
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Vigilado Por</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <picture>
                  <source srcSet={footerImages.logoSupersociedades.avif} type="image/avif" />
                  <source srcSet={footerImages.logoSupersociedades.webp} type="image/webp" />
                  <img
                    src={footerImages.logoSupersociedades.png}
                    alt="Logo Superintendencia de Sociedades"
                    className="h-12 w-auto"
                    width="250"
                    height="100"
                    loading="lazy"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Social Media and Legal Menu */}
      <section className="py-8 px-4 border-t border-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Media */}
            <div className="flex flex-col items-center md:items-start space-y-3">
              <p className="text-sm font-medium">Síguenos</p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/bskmotorcycleteam"
                  aria-label="Facebook BSK Motorcycle Team"
                  className="text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={20} />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="https://instagram.com/bskmotorcycleteam"
                  aria-label="Instagram BSK Motorcycle Team"
                  className="text-white hover:text-pink-500 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={20} />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://twitter.com/bskmotorcycleteam"
                  aria-label="Twitter BSK Motorcycle Team"
                  className="text-white hover:text-blue-300 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter size={20} />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="https://youtube.com/bskmotorcycleteam"
                  aria-label="YouTube BSK Motorcycle Team"
                  className="text-white hover:text-red-500 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube size={20} />
                  <span className="sr-only">YouTube</span>
                </a>
              </div>
            </div>

            {/* Legal Menu */}
            <nav aria-label="Menú legal">
              <ul className="flex flex-wrap justify-center gap-4 md:gap-6">
                <li>
                  <Link to="/documents" className="text-sm hover:underline">Condiciones</Link>
                </li>
                <li>
                  <Link to="/documents" className="text-sm hover:underline">Privacidad</Link>
                </li>
                <li>
                  <Link to="/documents" className="text-sm hover:underline">Mapa web</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Fourth Section - Copyright */}
      <section className="py-6 px-4 border-t border-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-xs md:text-sm space-y-2">
            <p>
              © {currentYear} BSK Motorcycle Team™ es una marca registrada de Organización Motear S.A.S., OMSAS. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;