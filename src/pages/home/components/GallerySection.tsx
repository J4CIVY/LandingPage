import React, { useState, useEffect } from "react";
import { GalleryImage } from '../types'; // Import the GalleryImage interface

const GallerySection: React.FC = () => {
  const [activeGalleryImage, setActiveGalleryImage] = useState<number>(0);

  const galleryImages: GalleryImage[] = [
    { id: 1, src: '/Banner_Algunos_Miembros_Motoclub_BSK_Motocycle_Team.webp', alt: 'Algunos Miembros De BSK Motorcycle Team' },
    { id: 2, src: '/Banner_Capacitacion_Seguridad_Vial_2025_BSK_Motocycle_Team.webp', alt: 'Capacitacion Seguridad Vial 2025 BSK Motorcycle Team' },
    { id: 3, src: '/Banner_Direct_To_Chochi_2025_Motoclub_BSK_Motocycle_Team.webp', alt: 'Direct To Choachi 2025 BSK Motorcycle Team' },
    { id: 4, src: '/Banner_Primer_Tinto_o_Aromatica_Junio_2024_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Primer Tinto O Aromatica Junio 2024 BSK Motorcycle Team' },
    { id: 5, src: '/Banner_Road_To_Villeta_2023_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Road To Villeta 2023 BSK Motorcycle Team' },
    { id: 6, src: '/Banner_Tour_Andino_2023_Motoclub_BSK_Motocycle_Team.webp', alt: 'Tour Andino 2023 BSK Motorcycle Team' }
  ];

  // Effect to auto-advance the gallery images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGalleryImage((prev: number) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Change image every 5 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [galleryImages.length]); // Re-run effect if galleryImages length changes (though it's static here)

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
          GALERÍA <span className="text-red-600">MULTIMEDIA</span>
        </h2>

        <div className="relative mb-8 rounded-xl overflow-hidden shadow-xl group" style={{ aspectRatio: '16/9' }}>
          <div className="relative w-full h-full" role="img" aria-live="polite" aria-atomic="true" aria-label={`Galería de imágenes, mostrando: ${galleryImages[activeGalleryImage].alt}`}>
            {galleryImages.map((image: GalleryImage, index: number) => (
              <img
                key={image.id} // Unique key for each image
                src={image.src}
                alt={image.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeGalleryImage ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy" // Lazy load images as they might not be in the initial viewport
              />
            ))}
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          {/* Text overlay showing the alt text of the active image */}
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <p className="text-xl">{galleryImages[activeGalleryImage].alt}</p>
          </div>

          {/* Navigation dots for the gallery */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {galleryImages.map((_, index: number) => (
              <button
                key={index} // Unique key for each button
                onClick={() => setActiveGalleryImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === activeGalleryImage ? 'bg-red-600 w-6' : 'bg-white bg-opacity-50'}`}
                aria-label={`Ir a imagen ${index + 1}`} // Accessible label for each dot
                aria-current={index === activeGalleryImage ? 'true' : 'false'} // ARIA attribute for current slide
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;