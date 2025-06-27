import React from "react";

const HeroSection = () => {
  // Configuración de Cloudinary
  const cloudName = "dz0peilmu"; // Tu cloud name de Cloudinary
  const imagePath = "Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql"; // Nombre de tu imagen en Cloudinary (sin extensión)
  
  // Parámetros comunes
  const commonParams = "q_auto:best,c_fill,g_auto";
  
  // Generación de srcSet para responsive
  const srcSetAvif = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1280/${imagePath} 1280w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1920/${imagePath} 1920w
  `;

  const srcSetWebp = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1280/${imagePath} 1280w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1920/${imagePath} 1920w
  `;

  const srcSetJpg = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_480/${imagePath} 480w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_768/${imagePath} 768w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1280/${imagePath} 1280w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1920/${imagePath} 1920w
  `;

  // URL de fallback (jpg)
  const fallbackSrc = `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1920/${imagePath}`;

  return (
    <section className="relative h-screen flex items-center justify-center bg-[#000031] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {/* Imagen optimizada con formatos modernos y responsive */}
        <picture>
          <source 
            srcSet={srcSetAvif} 
            type="image/avif"
            sizes="100vw"
          />
          <source 
            srcSet={srcSetWebp} 
            type="image/webp"
            sizes="100vw"
          />
          <img
            src={fallbackSrc}
            srcSet={srcSetJpg}
            sizes="100vw"
            alt="BSK Motorcycle Team"
            className="w-full h-full object-cover"
            style={{
              aspectRatio: '16/9',
              objectPosition: 'center center'
            }}
            width="1920"
            height="1080"
            loading="eager"
            fetchpriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          <span className="text-[#00FF99]">BSK</span> MOTORCYCLE TEAM
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
          Libertad sobre dos ruedas - Pasión, Camaradería y Aventura
        </p>
        <button className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
          ÚNETE AL CLUB
        </button>
      </div>
    </section>
  );
};

export default HeroSection;