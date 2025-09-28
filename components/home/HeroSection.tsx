'use client';

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useScrollToSection } from "@/hooks/useScroll";


const HeroSection: React.FC = () => {
  const cloudName: string = "dz0peilmu";
  const imagePath: string = "Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql";
  
  const router = useRouter();
  const { scrollToSection, isScrolling } = useScrollToSection();
  
  // Common Cloudinary transformation parameters for optimization
  const commonParams: string = "q_auto:best,c_fill,g_auto";
  
  // Define responsive image sources for different formats (AVIF, WebP, JPG)
  // Using a range of widths to cover various screen sizes efficiently
  const srcSetAvif: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1366/${imagePath} 1366w,
  `;

  const srcSetWebp: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1366/${imagePath} 1366w,
  `;

  const srcSetJpg: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath} 1366w,
  `;

  // Fallback source for browsers that don't support picture or webp/avif
  const fallbackSrc: string = `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath}`;

  /**
   * Handles the click event for the "ÚNETE AL CLUB" button, navigating to the memberships page.
   */
  const handleJoinClick = (): void => {
    router.push("/memberships");
  };

  /**
   * Handles the scroll to next section functionality
   */
  const handleScrollToNext = (): void => {
    // Usar el hook personalizado para scroll suave
    scrollToSection('#about-section, [data-section="about"]', {
      offset: 80, // Altura del header
      behavior: 'smooth'
    });
    
    // Analytics opcional (si tienes configurado)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'scroll_to_next_section', {
        event_category: 'engagement',
        event_label: 'hero_scroll_arrow'
      });
    }
  };

  return (
  <section className="relative h-screen flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden" role="banner" aria-label="Sección principal de BSK Motorcycle Team">
      <div className="absolute inset-0 w-full h-full">
        <picture>
          {/* AVIF source for best compression and quality */}
          <source 
            srcSet={srcSetAvif} 
            type="image/avif"
            sizes="100vw" // Image takes 100% of viewport width
          />
          {/* WebP source for good compression and broader support */}
          <source 
            srcSet={srcSetWebp} 
            type="image/webp"
            sizes="100vw"
          />
          {/* Fallback JPG image for maximum compatibility */}
          <Image
            src={fallbackSrc} // Default src for browsers that don't support srcset or picture
            alt="BSK Motorcycle Team - Comunidad unida por la pasión motociclista, rutas épicas y el espíritu aventurero sobre dos ruedas en Colombia" // Descriptive alt text for accessibility
            className="w-full h-full object-cover gpu-accelerated"
            // Inline style for aspect ratio and object position, can be moved to Tailwind config if used often
            style={{
              aspectRatio: '16/9',
              objectPosition: 'center center'
            }}
            width={1920} // Explicit width and height for layout shift prevention
            height={1080}
            priority
          />
        </picture>
        {/* Overlay to darken the image and improve text readability */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 dark:from-slate-950/80 dark:via-slate-900/60 dark:to-slate-950/80" aria-hidden="true"></div>
      </div>

      {/* Hero content: title, description, and call-to-action button */}
  <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <header>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white dark:text-white mb-6 leading-tight">
            <span className="text-green-400 dark:text-green-300">BSK</span> <span className="text-white dark:text-gray-100">MOTORCYCLE TEAM</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Únete al <strong className="text-green-400 dark:text-green-300">motoclub líder en Colombia</strong>, donde la comunidad se vive sobre dos ruedas. 
            Pasión motociclista, rutas épicas, eventos emocionantes y hermandad verdadera.
          </p>
        </header>
        
        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleJoinClick}
            className="bg-red-600 dark:bg-red-700 text-white dark:text-white px-8 py-4 rounded-full font-bold text-lg"
            aria-label="Únete a BSK Motorcycle Team - Accede a membresías exclusivas del motoclub"
          >
            <span role="img" aria-label="moto" className="mr-2 align-middle">🏍️</span> ÚNETE AL CLUB
          </button>
          
          <button
            onClick={() => router.push("/events")}
            className="border-2 border-white dark:border-gray-200 text-white dark:text-gray-200 bg-transparent dark:bg-transparent px-8 py-4 rounded-full font-bold text-lg"
            aria-label="Descubre nuestros eventos motociclísticos y rutas por Colombia"
          >
            <span role="img" aria-label="calendario" className="mr-2 align-middle">📅</span> VER EVENTOS
          </button>
        </div>

        {/* Indicadores adicionales */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-black/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 dark:text-green-300">500+</div>
            <div className="text-sm text-gray-200 dark:text-gray-300">Miembros Activos</div>
          </div>
          <div className="bg-black/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 dark:text-green-300">100+</div>
            <div className="text-sm text-gray-200 dark:text-gray-300">Rutas Realizadas</div>
          </div>
          <div className="bg-black/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 dark:text-green-300">3+</div>
            <div className="text-sm text-gray-200 dark:text-gray-300">Años de Experiencia</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Posicionado fuera del contenedor principal */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex flex-col items-center space-y-2">
          {/* Texto indicativo */}
          <span className="text-white/80 dark:text-gray-300 text-xs font-medium tracking-wider uppercase">
            Descubre más
          </span>
          
          {/* Botón de scroll principal */}
          <button
            onClick={handleScrollToNext}
            disabled={isScrolling}
            className={`p-4 rounded-full text-white/80 dark:text-gray-300 ${
              isScrolling ? 'opacity-75 scale-95 cursor-not-allowed' : ''
            }`}
            aria-label="Desplázate hacia abajo para conocer más sobre BSK Motorcycle Team"
          >
            <svg 
              className={`w-5 h-5 ${isScrolling ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </button>

          {/* Línea indicadora */}
          <div className="w-0.5 h-12 bg-gradient-to-b from-white/60 dark:from-gray-300/60 via-white/30 dark:via-gray-300/30 to-transparent relative overflow-hidden">
            <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-green-400/60 dark:from-green-300/60 to-transparent opacity-80"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
