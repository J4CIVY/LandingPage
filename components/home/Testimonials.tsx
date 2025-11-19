'use client';

import { type FC } from "react";
import Image from "next/image";

const Testimonials: FC = () => {
  const cloudName: string = "dz0peilmu";
  const imagePath1: string = "member1_yq8lbk";
  const imagePath2: string = "member2_ryixrt";

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
      <h3 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4 text-center">TESTIMONIOS DE MIEMBROS</h3>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">39 miembros activos, miles de kilómetros, una sola pasión</p>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Primer testimonio */}
        <div className="bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif1} />
              <source type="image/webp" srcSet={srcSetWebp1} />
              <source type="image/jpeg" srcSet={srcSetJpg1} />
              <Image
                src={fallbackSrc1}
                alt="Retrato de Carlos Méndez, miembro del club"
                className="w-16 h-16 rounded-full mr-6"
                loading="lazy"
                width={125}
                height={125}
              />
            </picture>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-white">Carlos Méndez</h4>
              <p className="text-green-400 dark:text-green-400">Miembro desde 2024</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 italic">"Cuando mi moto se varó a 200 km de Bogotá en pleno Tour Andino, recibí asistencia por parte del club y fue suficiente para continuar y no perdermne de la rodada. No es solo un seguro, es tener una familia que te respalda en cada kilómetro."</p>
        </div>

        {/* Segundo testimonio */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif2} />
              <source type="image/webp" srcSet={srcSetWebp2} />
              <source type="image/jpeg" srcSet={srcSetJpg2} />
              <Image
                src={fallbackSrc2}
                alt="Retrato de Laura Torres, miembro del club"
                className="w-16 h-16 rounded-full mr-6"
                loading="lazy"
                width={125}
                height={125}
              />
            </picture>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-white">Laura Torres</h4>
              <p className="text-green-400 dark:text-green-400">Miembro desde 2022</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 italic">"Los ahorros en repuestos ya cubrieron mi membresía tres veces. Pero lo que realmente vale es la comunidad: he encontrado amigos para toda la vida y una segunda familia sobre ruedas."</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;

