import React from "react";
import { useNavigate } from "react-router-dom";

const Testimonials: React.FC = () => {
  const cloudName: string = "dz0peilmu";
  const imagePath1: string = "member1_yq8lbk";
  const imagePath2: string = "member2_ryixrt";

  const navigate = useNavigate();

  const commonParams: string = "q_auto:best,c_fill,g_auto";

  const srcSetAvif1: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_125/${imagePath1} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_250/${imagePath1} 250w
  `;

  const srcSetWebp1: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_125/${imagePath1} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_250/${imagePath1} 250w
  `;

  const srcSetJpg1: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_125/${imagePath1} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_250/${imagePath1} 250w
  `;

  const fallbackSrc1: string = `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_125/${imagePath1}`;

  const srcSetAvif2: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_125/${imagePath2} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_250/${imagePath2} 250w
  `;

  const srcSetWebp2: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_125/${imagePath2} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_250/${imagePath2} 250w
  `;

  const srcSetJpg2: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_125/${imagePath2} 125w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_250/${imagePath2} 250w
  `;

  const fallbackSrc2: string = `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_125/${imagePath2}`;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-semibold text-slate-950 mb-8 text-center">TESTIMONIOS DE MIEMBROS</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Primer testimonio */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif1} />
              <source type="image/webp" srcSet={srcSetWebp1} />
              <source type="image/jpeg" srcSet={srcSetJpg1} />
              <img 
                src={fallbackSrc1} 
                alt="Retrato de Carlos Méndez, miembro del club" 
                className="w-16 h-16 rounded-full mr-6" 
                loading="lazy" 
                width="125"
                height="125"
                crossOrigin="anonymous"
              />
            </picture>
            <div>
              <h4 className="text-xl font-bold text-slate-950">Carlos Méndez</h4>
              <p className="text-green-400">Miembro desde 2024</p>
            </div>
          </div>
          <p className="text-gray-700 italic">"La asistencia en carretera que ofrece el club me dio tranquilidad en mi último viaje largo. Saber que tenía apoyo en caso de emergencia hizo toda la diferencia."</p>
        </div>

        {/* Segundo testimonio */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif2} />
              <source type="image/webp" srcSet={srcSetWebp2} />
              <source type="image/jpeg" srcSet={srcSetJpg2} />
              <img 
                src={fallbackSrc2} 
                alt="Retrato de Laura Torres, miembro del club" 
                className="w-16 h-16 rounded-full mr-6" 
                loading="lazy" 
                width="125"
                height="125"
                crossOrigin="anonymous"
              />
            </picture>
            <div>
              <h4 className="text-xl font-bold text-slate-950">Laura Torres</h4>
              <p className="text-green-400">Miembro desde 2022</p>
            </div>
          </div>
          <p className="text-gray-700 italic">"Los descuentos en repuestos y talleres ya han cubierto el costo de mi membresía varias veces. Además, la comunidad es increíble, he hecho amigos para toda la vida."</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;