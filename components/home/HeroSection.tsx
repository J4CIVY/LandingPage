'use client';

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


const HeroSection: React.FC = () => {
  const cloudName: string = "dz0peilmu";
  const imagePath: string = "Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql";
  
  const router = useRouter();
  
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

  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 overflow-hidden" role="banner" aria-label="Sección principal de BSK Motorcycle Team">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" aria-hidden="true"></div>
      </div>

      {/* Hero content: title, description, and call-to-action button */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <header>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white dark:text-white mb-6 leading-tight">
            <span className="text-green-400">BSK</span> MOTORCYCLE TEAM
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white dark:text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Únete al <strong className="text-green-400">motoclub líder en Colombia</strong>, donde la comunidad se vive sobre dos ruedas. 
            Pasión motociclista, rutas épicas, eventos emocionantes y hermandad verdadera.
          </p>
        </header>
        
        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleJoinClick}
            className="btn-focus bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl touch-target"
            aria-label="Únete a BSK Motorcycle Team - Accede a membresías exclusivas del motoclub"
          >
            🏍️ ÚNETE AL CLUB
          </button>
          
          <button
            onClick={() => router.push("/events")}
            className="btn-focus bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 touch-target"
            aria-label="Descubre nuestros eventos motociclísticos y rutas por Colombia"
          >
            📅 VER EVENTOS
          </button>
        </div>

        {/* Indicadores adicionales */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">500+</div>
            <div className="text-sm text-gray-200">Miembros Activos</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">100+</div>
            <div className="text-sm text-gray-200">Rutas Realizadas</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">3+</div>
            <div className="text-sm text-gray-200">Años de Experiencia</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="sr-only">Desplázate hacia abajo para ver más contenido</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
