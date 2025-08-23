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
    <section className="relative h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 overflow-hidden">
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
            alt="BSK Motorcycle Team - Miembros del motoclub disfrutando la libertad sobre dos ruedas en paisaje colombiano" // Descriptive alt text for accessibility
            className="w-full h-full object-cover"
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
        <div className="absolute inset-0 bg-black opacity-50 dark:opacity-60"></div>
      </div>

      {/* Hero content: title, description, and call-to-action button */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white dark:text-white mb-6">
          <span className="text-green-400">BSK</span> MOTORCYCLE TEAM
        </h1>
        <p className="text-xl md:text-2xl text-white dark:text-gray-200 mb-8 max-w-2xl mx-auto">
          Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
        </p>
        <button 
          onClick={handleJoinClick}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg"
          aria-label="Únete al club BSK Motorcycle Team" // Accessible label for the button
        >
          ÚNETE AL CLUB
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
