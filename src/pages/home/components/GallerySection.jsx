import React, { useState, useEffect } from "react";

const GallerySection = () => {
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);

  const galleryImages = [
    { id: 1, src: '/Banner_Algunos_Miembros_Motoclub_BSK_Motocycle_Team.webp', alt: 'Algunos Miembros De BSK Motorcycle Team' },
    { id: 2, src: '/Banner_Capacitacion_Seguridad_Vial_2025_BSK_Motocycle_Team.webp', alt: 'Capacitacion Seguridad Vial 2025 BSK Motorcycle Team' },
    { id: 3, src: '/Banner_Direct_To_Chochi_2025_Motoclub_BSK_Motocycle_Team.webp', alt: 'Direct To Choachi 2025 BSK Motorcycle Team' },
    { id: 4, src: '/Banner_Primer_Tinto_o_Aromatica_Junio_2024_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Primer Tinto O Aromatica Junio 2024 BSK Motorcycle Team' },
    { id: 5, src: '/Banner_Road_To_Villeta_2023_Motoclub_BSK_Motorcycle_Team.webp', alt: 'Road To Villeta 2023 BSK Motorcycle Team' },
    { id: 6, src: '/Banner_Tour_Andino_2023_Motoclub_BSK_Motocycle_Team.webp', alt: 'Tour Andino 2023 BSK Motorcycle Team' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGalleryImage((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
          GALERÍA <span className="text-red-600">MULTIMEDIA</span>
        </h2>

        <div className="relative mb-8 rounded-xl overflow-hidden shadow-xl group" style={{ aspectRatio: '16/9' }}>
          <div className="relative w-full h-full">
            {galleryImages.map((image, index) => (
              <img
                key={image.id}
                src={image.src}
                alt={image.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeGalleryImage ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <p className="text-xl">{galleryImages[activeGalleryImage].alt}</p>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveGalleryImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === activeGalleryImage ? 'bg-red-600 w-6' : 'bg-white bg-opacity-50'}`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;