import React from "react";
import Image from "next/image";
import { AnimatedHeading, AnimatedParagraph, AnimatedText } from "@/components/animations/AnimatedText";

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
        <AnimatedHeading 
          level={2}
          animationType="slideUp"
          delay={100}
          className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12"
        >
          SOBRE <span className="text-red-600">NOSOTROS</span>
        </AnimatedHeading>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <AnimatedHeading 
              level={3}
              animationType="slideInLeft"
              delay={200}
              className="text-2xl font-semibold text-slate-950 dark:text-white mb-4"
            >
              Nuestra Historia
            </AnimatedHeading>
            <AnimatedParagraph 
              animationType="fadeIn"
              delay={300}
              className="text-gray-700 dark:text-gray-300 mb-6"
            >
              BSK Motorcycle Team nació en 2022 en Bogotá, Colombia, donde la comunidad se vive sobre dos ruedas. Desde nuestra fundación, nos une la pasión por el motociclismo, el espíritu aventurero y el respeto mutuo, creando una familia que trasciende las rutas.
            </AnimatedParagraph>
            <AnimatedParagraph 
              animationType="fadeIn"
              delay={400}
              className="text-gray-700 dark:text-gray-300 mb-6"
            >
              En nuestro primer año consolidamos rutas emblemáticas como el Tour Andino, el Tour de la Tatacoa y el Tour de Navidad, estableciendo una tradición de recorrer Colombia con camaradería. Hoy somos 39 miembros activos unidos por algo más grande que nosotros mismos.
            </AnimatedParagraph>
            <AnimatedParagraph 
              animationType="fadeIn"
              delay={500}
              className="text-gray-700 dark:text-gray-300 mb-6"
            >
              Respaldados por Organización Motear SAS (OMSAS), mantenemos nuestra misión de crear un espacio donde cada motociclista encuentra no solo aventura, sino una segunda familia sobre ruedas.
            </AnimatedParagraph>

            <AnimatedHeading 
              level={3}
              animationType="slideInLeft"
              delay={600}
              className="text-2xl font-semibold text-slate-950 dark:text-white mb-4 mt-8"
            >
              Nuestros Valores
            </AnimatedHeading>
            <ul className="space-y-3">
              <li className="flex items-start">
                <AnimatedParagraph 
                  animationType="slideInLeft"
                  delay={700}
                  className="flex items-start"
                >
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Comunidad: Somos una familia de motociclistas, unidos por la confianza, la lealtad y el apoyo mutuo dentro y fuera de la carretera.</span>
                </AnimatedParagraph>
              </li>
              <li className="flex items-start">
                <AnimatedParagraph 
                  animationType="slideInLeft"
                  delay={850}
                  className="flex items-start"
                >
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Espíritu: Mantenemos vivo el espíritu aventurero, disfrutando cada ruta con pasión, alegría y la energía que nos impulsa a descubrir nuevos caminos.</span>
                </AnimatedParagraph>
              </li>
              <li className="flex items-start">
                <AnimatedParagraph 
                  animationType="slideInLeft"
                  delay={1000}
                  className="flex items-start"
                >
                  <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                  <span className="text-gray-700 dark:text-gray-300">Respeto: Valoramos y cuidamos a cada miembro y a cada comunidad que visitamos, promoviendo la tolerancia, la responsabilidad y la seguridad en todo momento.</span>
                </AnimatedParagraph>
              </li>
            </ul>
          </div>

          <AnimatedText
            animationType="slideInRight"
            delay={200}
            className="relative h-96 rounded-xl overflow-hidden shadow-2xl"
          >
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
              <AnimatedParagraph 
                animationType="fadeIn"
                delay={1200}
                className="text-xl italic"
              >
                "Más que rutas, creamos recuerdos. Desde el primer día, eres parte de algo más grande."
              </AnimatedParagraph>
              <AnimatedParagraph 
                animationType="fadeIn"
                delay={1400}
                className="mt-2 font-semibold"
              >
                - Carlos M., Miembro desde 2022
              </AnimatedParagraph>
            </div>
          </AnimatedText>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

