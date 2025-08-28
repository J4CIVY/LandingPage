import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';
import { footerImages } from '@/data/images';
import Image from 'next/image';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-950 dark:text-gray-500" role="contentinfo">
      {/* First Section - Logo and Motto */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
          {/* Logo del Club para modo claro */}
          <picture className="block dark:hidden">
            <source srcSet={footerImages.logoClubLight.avif} type="image/avif" />
            <source srcSet={footerImages.logoClubLight.webp} type="image/webp" />
            <Image
              src={footerImages.logoClubLight.jpg}
              alt="Logo BSK Motorcycle Team - Motoclub de comunidad, espíritu y respeto"
              className="h-44 w-auto"
              width="854"
              height="480"
              loading="lazy"
            />
          </picture>

          {/* Logo del Club para modo oscuro */}
          <picture className="hidden dark:block">
            <source srcSet={footerImages.logoClubDark.avif} type="image/avif" />
            <source srcSet={footerImages.logoClubDark.webp} type="image/webp" />
            <Image
              src={footerImages.logoClubDark.jpg}
              alt="Logo BSK Motorcycle Team - Motoclub de comunidad, espíritu y respeto"
              className="h-44 w-auto"
              width="854"
              height="480"
              loading="lazy"
            />
          </picture>
          <p className="text-base font-light italic text-center text-slate-900 dark:text-white">Donde la comunidad se vive sobre dos ruedas</p>
        </div>
      </section>

      {/* Second Section - Support and Oversight */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Support - Innpulsa Logo */}
            <div className="flex flex-col items-center space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-950 dark:text-white">Con El Apoyo De</h4>
              {/* Logo Innpulsa para modo claro */}
              <picture className="block dark:hidden">
                <source srcSet={footerImages.logoInnpulsaLight.avif} type="image/avif" />
                <source srcSet={footerImages.logoInnpulsaLight.webp} type="image/webp" />
                <Image
                  src={footerImages.logoInnpulsaLight.png}
                  alt="Logo Innpulsa Colombia"
                  className="h-12 w-auto"
                  width="250"
                  height="100"
                  loading="lazy"
                />
              </picture>

              {/* Logo Innpulsa para modo oscuro */}
              <picture className="hidden dark:block">
                <source srcSet={footerImages.logoInnpulsaDark.avif} type="image/avif" />
                <source srcSet={footerImages.logoInnpulsaDark.webp} type="image/webp" />
                <Image
                  src={footerImages.logoInnpulsaDark.png}
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-950 dark:text-white">Vigilado Por</h4>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Superintendencia para modo claro */}
                <picture className="block dark:hidden">
                  <source srcSet={footerImages.logoSupersociedadesLight.avif} type="image/avif" />
                  <source srcSet={footerImages.logoSupersociedadesLight.webp} type="image/webp" />
                  <Image
                    src={footerImages.logoSupersociedadesLight.png}
                    alt="Logo Superintendencia de Sociedades"
                    className="h-12 w-auto"
                    width="250"
                    height="100"
                    loading="lazy"
                  />
                </picture>

                {/* Logo Superintendencia para modo oscuro */}
                <picture className="hidden dark:block">
                  <source srcSet={footerImages.logoSupersociedadesDark.avif} type="image/avif" />
                  <source srcSet={footerImages.logoSupersociedadesDark.webp} type="image/webp" />
                  <Image
                    src={footerImages.logoSupersociedadesDark.png}
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
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Media */}
            <div className="flex flex-col items-center md:items-start space-y-3">
              <p className="text-sm font-medium text-slate-950 dark:text-white">Síguenos</p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/bskmotorcycleteam"
                  aria-label="Facebook BSK Motorcycle Team"
                  className="text-slate-950 dark:text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={20} />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="https://instagram.com/bskmotorcycleteam"
                  aria-label="Instagram BSK Motorcycle Team"
                  className="text-slate-950 dark:text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={20} />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://twitter.com/bskmotorcycleteam"
                  aria-label="Twitter BSK Motorcycle Team"
                  className="text-slate-950 dark:text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter size={20} />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="https://youtube.com/bskmotorcycleteam"
                  aria-label="YouTube BSK Motorcycle Team"
                  className="text-slate-950 dark:text-white hover:text-blue-400 transition-colors flex items-center gap-2"
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
                  <Link href="/documents#terms-conditions" className="text-sm hover:underline text-slate-900 dark:text-white">Condiciones</Link>
                </li>
                <li>
                  <Link href="/documents#privacy-policy" className="text-sm hover:underline text-slate-900 dark:text-white">Privacidad</Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="text-sm hover:underline text-slate-900 dark:text-white" target="_blank" rel="noopener">Mapa web</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Fourth Section - Copyright */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-xs md:text-sm space-y-2 text-slate-900 dark:text-white">
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
