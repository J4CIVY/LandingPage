'use client';

import React, { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const GallerySection: React.FC = () => {
  const [activeGalleryImage, setActiveGalleryImage] = useState<number>(0);
  const cloudName: string = "dz0peilmu";
  const commonParams: string = "q_auto:best,c_fill,g_auto";

  // Función para generar los srcSets para cada imagen
  const generateImageSources = (imagePath: string, altText: string) => {
    return {
      avif: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1920/${imagePath} 1920w
      `,
      webp: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1920/${imagePath} 1920w
      `,
      jpg: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1920/${imagePath} 1920w
      `,
      fallback: `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath}`,
      alt: altText
    };
  };

  const galleryImages = [
    generateImageSources(
      'Banner_Algunos_Miembros_Motoclub_BSK_Motocycle_Team_brbdwz',
      'Algunos Miembros De BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Capacitacion_Seguridad_Vial_2025_BSK_Motocycle_Team_o7shib',
      'Capacitacion Seguridad Vial 2025 BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Direct_To_Chochi_2025_Motoclub_BSK_Motocycle_Team_ijdjc2',
      'Direct To Choachi 2025 BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Primer_Tinto_o_Aromatica_Junio_2024_Motoclub_BSK_Motorcycle_Team_eqhcms',
      'Primer Tinto O Aromatica Junio 2024 BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Road_To_Villeta_2023_Motoclub_BSK_Motorcycle_Team_shlbwz',
      'Road To Villeta 2023 BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Tour_Andino_2023_Motoclub_BSK_Motocycle_Team_yhjpks',
      'Tour Andino 2023 BSK Motorcycle Team'
    ),
    generateImageSources(
      'Banner_Tour_Perimetral_2025_Motoclub_BSK_Motocycle_Team_nr15v3',
      'Tour Perimetral 2025 BSK Motorcycle Team'
    )
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGalleryImage((prev: number) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
          GALERÍA <span className="text-red-600">MULTIMEDIA</span>
        </h2>

        <div className="relative mb-8 rounded-xl overflow-hidden shadow-xl group" style={{ aspectRatio: '16/9' }}>
          <div className="relative w-full h-full" role="img" aria-live="polite" aria-atomic="true" aria-label={`Galería de imágenes, mostrando: ${galleryImages[activeGalleryImage].alt}`}>
            {galleryImages.map((image, index) => (
              <div
                key={`image-container-${index}`}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === activeGalleryImage ? 'opacity-100' : 'opacity-0'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <LazyLoadImage
                  alt={image.alt}
                  src={image.fallback}
                  srcSet={`${image.jpg}, ${image.webp}, ${image.avif}`}
                  sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px"
                  effect="blur"
                  width={1366}
                  height={768}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <p className="text-xl">{galleryImages[activeGalleryImage].alt}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {galleryImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`w-3 h-3 rounded-full transition-colors ${index === activeGalleryImage ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600 hover:bg-red-400'}`}
              onClick={() => setActiveGalleryImage(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
              aria-current={index === activeGalleryImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;

