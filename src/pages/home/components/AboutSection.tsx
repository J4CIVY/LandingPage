import React from "react";

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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
          SOBRE <span className="text-red-600">NOSOTROS</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950 mb-4">Nuestra Historia</h3>
            <p className="text-gray-700 mb-6">
              BSK Motorcycle Team nació en 2022 en Bogotá, Colombia, como el sueño de un grupo de motociclistas apasionados por la aventura, la hermandad y el respeto. Desde su fundación, el club se ha caracterizado por organizar rodadas, tours y eventos de formación para fortalecer las habilidades de conducción de sus miembros.
            </p>
            <p className="text-gray-700 mb-6">
              En su primer año, el club consolidó rutas como el Tour Andino, el Tour de la Tatacoa y el Tour de Navidad, estableciendo así una tradición de recorrer los caminos de Colombia con un espíritu de camaradería. Posteriormente, se creó una estructura organizacional sólida, respaldada por la empresa Organización Motear SAS (OMSAS), y se estableció una filosofía basada en hermandad, espíritu aventurero y respeto mutuo.
            </p>
            <p className="text-gray-700 mb-6">
              A lo largo de su historia, BSK ha crecido en membresías, actividades y beneficios, manteniéndose fiel a su misión de crear un espacio seguro y divertido para amantes de la motocicleta, con visión de ser un referente en el motociclismo turístico y formativo en Colombia.
            </p>

            <h3 className="text-2xl font-semibold text-slate-950 mb-4 mt-8">Nuestros Valores</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                <span className="text-gray-700">Hermandad: Somos una familia de motociclistas, unidos por la confianza, la lealtad y el apoyo mutuo dentro y fuera de la carretera.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                <span className="text-gray-700">Espíritu: Mantenemos vivo el espíritu aventurero, disfrutando cada ruta con pasión, alegría y la energía que nos impulsa a descubrir nuevos caminos.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2" aria-hidden="true">✔</span>
                <span className="text-gray-700">Respeto: Valoramos y cuidamos a cada miembro y a cada comunidad que visitamos, promoviendo la tolerancia, la responsabilidad y la seguridad en todo momento.</span>
              </li>
            </ul>
          </div>

          <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
            <picture>
              <source type="image/avif" srcSet={srcSetAvif} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <source type="image/webp" srcSet={srcSetWebp} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <source type="image/jpeg" srcSet={srcSetJpg} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
              <img
                src={fallbackSrc}
                alt="Miembros del BSK Motorcycle Team durante el Tour Andino 2023"
                className="w-full h-full object-cover"
                loading="lazy"
                width="1366"
                height="768"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="text-xl italic">"No es solo un club, es una familia sobre ruedas."</p>
              <p className="mt-2 font-semibold">- Carlos M., Miembro desde 2022</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;