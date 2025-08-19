'use client';

import { useState, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/data/navigation';
import Image from 'next/image';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ className = '', ...props }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const cloudName = "dz0peilmu";
  const logoUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMenuOpen]);

  return (
    <header
      ref={ref}
      className={`w-full bg-slate-950 shadow-md py-1 ${className}`}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="focus:outline-none ml-3 md:ml-4" aria-label="Ir a inicio">
            <picture>
              <source srcSet={logoUrl.avif} type="image/avif" />
              <source srcSet={logoUrl.webp} type="image/webp" />
              <Image
                src={logoUrl.png}
                alt="Logo Motoclub BSK Motorcycle Team"
                className="w-[80px] md:w-[80px] h-auto object-contain"
                width={80}
                height={80}
                priority
              />
            </picture>
          </Link>

          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`text-white hover:text-green-400 transition-colors ${pathname === item.path ? 'text-green-400 font-bold' : ''
                      }`}
                    aria-current={pathname === item.path ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className="md:hidden text-white focus:outline-none mr-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menú"
          >
            <div className="w-6 flex flex-col items-end">
              <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-6 -rotate-45' : 'w-4'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[76px] bg-slate-950 z-40 overflow-y-auto"
          role="navigation"
          aria-label="Menú principal móvil"
        >
          <div className="container mx-auto px-5 py-8 flex flex-col h-full">
            <ul className="flex-1 flex flex-col space-y-6 pl-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-white text-xl font-medium hover:text-green-400 transition-colors ${pathname === item.path ? 'text-green-400 font-bold' : ''
                      }`}
                    aria-current={pathname === item.path ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto pb-8 pl-2">
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-4">Asistencia de Emergencia</h3>
                <p className="text-white text-sm mb-4">
                  Solicitar Asistencia Técnica O De Emergencias
                </p>
                <Link
                  href="/sos"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded hover:bg-red-700 transition-colors mb-4 text-center"
                >
                  Botón SOS
                </Link>
                <div className="text-white text-sm">
                  <p>Contacto de emergencia:</p>
                  <p>Teléfono: +57 312 519 2000</p>
                  <p>Email: emergencias@bskmt.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default Header;
