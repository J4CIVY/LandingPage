'use client';

import { useState, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/data/navigation';
import Image from 'next/image';
import SearchComponent from './SearchComponent';
import AuthButton from './AuthButton';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ className = '', ...props }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const cloudName = "dz0peilmu";
  
  // Logo blanco para modo oscuro
  const logoWhiteUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`
  };

  // Logo azul para modo claro
  const logoBlueUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`
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
    <>
      <header
        ref={ref}
        className={`fixed top-0 left-0 right-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-1 z-50 shadow-md border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300 ${className}`}
        role="banner"
        {...props}
      >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-full">
          {/* Logo a la izquierda */}
          <Link href="/" className="focus-enhanced ml-3 md:ml-4" aria-label="BSK Motorcycle Team - Ir a la página de inicio">
            {/* Logo para modo claro (azul) */}
            <picture className="block dark:hidden">
              <source srcSet={logoBlueUrl.avif} type="image/avif" />
              <source srcSet={logoBlueUrl.webp} type="image/webp" />
                <Image
                  src={logoBlueUrl.png}
                  alt="Logo BSK Motorcycle Team - Motoclub líder en Colombia con comunidad unida por la pasión motociclista"
                  className="w-[55px] md:w-[55px] h-auto object-contain hover:scale-105"
                  width={55}
                  height={55}
                  priority
                />
            </picture>
            
            {/* Logo para modo oscuro (blanco) */}
            <picture className="hidden dark:block">
              <source srcSet={logoWhiteUrl.avif} type="image/avif" />
              <source srcSet={logoWhiteUrl.webp} type="image/webp" />
                <Image
                  src={logoWhiteUrl.png}
                  alt="Logo BSK Motorcycle Team - Motoclub líder en Colombia con comunidad unida por la pasión motociclista"
                  className="w-[55px] md:w-[55px] h-auto object-contain hover:scale-105"
                  width={55}
                  height={55}
                  priority
                />
            </picture>
          </Link>

          {/* Navegación centrada en desktop */}
          <nav id="navigation" className="hidden md:flex flex-1 justify-center" role="navigation" aria-label="Navegación principal">
            <ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`text-slate-950 dark:text-white hover:text-green-400 focus-enhanced touch-target ${pathname === item.path ? 'text-green-400 font-bold' : ''
                      }`}
                    aria-current={pathname === item.path ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Barra de búsqueda y auth a la derecha */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchComponent isCollapsible={true} />
            <AuthButton />
          </div>

          {/* Botón móvil */}
          <button
            className="md:hidden text-slate-950 dark:text-white focus:outline-none mr-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menú"
          >
            <div className="w-6 flex flex-col items-end">
              <span className={`block h-0.5 w-6 bg-slate-950 dark:bg-white rounded-full ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 bg-slate-950 dark:bg-white rounded-full ${isMenuOpen ? 'w-6 -rotate-45' : 'w-4'}`}></span>
            </div>
          </button>
        </div>
      </div>
      </header>
      
      {/* Menú móvil fuera del header para evitar problemas de z-index */}
      {isMenuOpen && (
        <>
          {/* Overlay de fondo */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menú móvil */}
          <div
            className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-white dark:bg-slate-950 z-50 overflow-y-auto shadow-2xl"
            role="navigation"
            aria-label="Menú principal móvil"
          >
            <div className="container mx-auto px-5 py-8 flex flex-col h-full">
              {/* Búsqueda en móvil */}
              <div className="mb-6">
                <SearchComponent />
              </div>

              <ul className="flex-1 flex flex-col space-y-6 pl-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-slate-950 dark:text-white text-xl font-medium hover:text-green-400 ${pathname === item.path ? 'text-green-400 font-bold' : ''
                        }`}
                      aria-current={pathname === item.path ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="pl-2">
                <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
                  <h3 className="text-slate-950 dark:text-white font-bold mb-4">Asistencia de Emergencia</h3>
                  <Link
                    href="/sos"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 mb-4 text-center"
                  >
                    Solicitar Asistencia Técnica O De Emergencias
                  </Link>
                </div>

                {/* Pie del menú móvil con autenticación */}
                <div className="border-t border-gray-300 dark:border-gray-700 pt-6 mt-6">
                  <div className="bg-white dark:bg-slate-950 rounded-lg p-4">
                    <AuthButton isMobile={true} onMobileAction={() => setIsMenuOpen(false)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default Header;
