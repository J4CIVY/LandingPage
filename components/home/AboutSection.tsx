import React from "react";
import Image from "next/image";

const AboutSection: React.FC = () => {
  const cloudName: string = "dz0peilmu";
  const imagePath: string = "Banner_Tour_Andino_Motoclub_BSK_Motocycle_Team_2023_Carlos_is4ynj";

  const commonParams: string = "q_auto:best,c_fill,g_auto";

  // Definir los srcSets para diferentes formatos y tamaños
  const srcSetAvif: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_683/${imagePath} 683w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1366/${imagePath} 1366w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1920/${imagePath} 1920w
  `;

  const srcSetWebp: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_683/${imagePath} 683w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1366/${imagePath} 1366w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1920/${imagePath} 1920w
  `;

  const srcSetJpg: string = `
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_683/${imagePath} 683w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1024/${imagePath} 1024w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath} 1366w,
    https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1920/${imagePath} 1920w
  `;

  const fallbackSrc: string = `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath}`;

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
          SOBRE <span className="text-red-600">NOSOTROS</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">
              Nuestra Historia
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              BSK Motorcycle Team nació en 2022 en Bogotá, Colombia, en el corazón de una comunidad que vive intensamente sobre dos ruedas. Desde nuestra fundación nos ha movido la pasión por el motociclismo, el espíritu aventurero y el respeto mutuo, creando no solo un motoclub, sino una familia que trasciende fronteras y rutas.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              En nuestro primer año consolidamos rutas emblemáticas como el Tour Andino, el Tour de la Tatacoa y el Tour de Navidad, estableciendo una tradición de recorrer Colombia con camaradería, disciplina y amor por la carretera. Hoy somos 39 miembros activos, unidos por un propósito que va más allá de rodar: vivir y compartir el motociclismo como estilo de vida.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Respaldados legalmente por Organización Motear SAS (NIT 901444877), mantenemos nuestra misión de ser un espacio donde cada motociclista encuentra aventura, crecimiento personal y una segunda familia sobre ruedas.
            </p>

            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4 mt-8">
              Nuestros Valores
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Comunidad: Más que un club, somos una familia de motociclistas unida por la confianza, la lealtad y el apoyo dentro y fuera de la carretera.</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Espíritu: Alimentamos la pasión y el espíritu aventurero, disfrutando cada ruta con alegría, disciplina y energía para descubrir nuevos caminos.</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Respeto: Promovemos la seguridad, la tolerancia y la responsabilidad, cuidando a nuestros miembros y a las comunidades que visitamos.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <source type="image/webp" srcSet={srcSetWebp} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <source type="image/jpeg" srcSet={srcSetJpg} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <Image
                src={fallbackSrc}
                alt="Miembros del BSK Motorcycle Team durante el Tour Andino 2023"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1366}
                height={768}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="text-xl italic">
                "Más que rutas, creamos recuerdos. Desde el primer día, eres parte de algo más grande."
              </p>
              <p className="mt-2 font-semibold">
                - Carlos M., Miembro desde 2022
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

