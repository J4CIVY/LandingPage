/**
 * Centralized SEO Configuration for BSK Motorcycle Team
 * This file contains all default SEO settings, social media configurations,
 * and structured data templates used across the website.
 */

import { DefaultSeoProps } from 'next-seo';

const SITE_URL = 'https://bskmt.com';
const SITE_NAME = 'BSK Motorcycle Team';
const SITE_DESCRIPTION = '🏍️ Únete al motoclub #1 de Colombia. +500 miembros activos, +100 rutas épicas, eventos semanales, talleres especializados y hermandad verdadera. Comunidad BSK MT en Bogotá donde la pasión motociclista se vive sobre dos ruedas.';

export const DEFAULT_SEO: DefaultSeoProps = {
  defaultTitle: `${SITE_NAME} - Motoclub #1 en Colombia | Comunidad Motera Bogotá`,
  titleTemplate: `%s | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  canonical: SITE_URL,
  
  // Mobile & PWA
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover',
    },
    {
      name: 'keywords',
      content: 'BSK Motorcycle Team, motoclub colombia, motoclub bogotá, BSKMT, mejor motoclub colombia, comunidad motera colombia, club de motos bogotá, rutas en moto bogotá, eventos motociclismo colombia, viajes en moto colombia, club motocicletas bogotá, mototurismo colombia, talleres motociclismo bogotá, escuela de motociclismo, cursos manejo moto colombia, motoclones bogotá, bikers colombia, moteros bogotá, moto club colombia, grupos de motos bogotá, comunidad biker colombia, cursos conducción moto, mantenimiento motocicletas, seguridad vial motos, membresías motoclub, beneficios motoclub, asistencia en ruta, como unirse a un motoclub, mejor club de motos colombia, motoclub cerca de mi, eventos motos colombia 2025, rutas motociclistas colombia',
    },
    {
      name: 'author',
      content: SITE_NAME,
    },
    {
      name: 'application-name',
      content: 'BSK MT',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'BSK MT',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'theme-color',
      content: '#000000',
    },
    {
      name: 'msapplication-TileColor',
      content: '#000000',
    },
    {
      name: 'format-detection',
      content: 'telephone=yes',
    },
    // Geo-location tags
    {
      name: 'geo.region',
      content: 'CO-DC',
    },
    {
      name: 'geo.placename',
      content: 'Bogotá',
    },
    {
      name: 'geo.position',
      content: '4.562477;-74.101509',
    },
    {
      name: 'ICBM',
      content: '4.562477, -74.101509',
    },
    // Language & Distribution
    {
      name: 'language',
      content: 'Spanish',
    },
    {
      name: 'revisit-after',
      content: '7 days',
    },
    {
      name: 'rating',
      content: 'General',
    },
    {
      name: 'distribution',
      content: 'Global',
    },
    {
      name: 'target',
      content: 'all',
    },
  ],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - El Motoclub #1 de Colombia`,
    description: '🏍️ El motoclub más grande de Colombia. Comunidad de moteros unidos por la pasión. Rutas épicas cada semana, eventos exclusivos, talleres profesionales y asistencia 24/7. ¡Únete a la familia BSK MT!',
    images: [
      {
        url: 'https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/og-image-bsk-motorcycle-team.jpg',
        width: 1200,
        height: 630,
        alt: 'BSK Motorcycle Team - El motoclub líder en Colombia con más de 500 miembros activos, rutas épicas y comunidad unida por la pasión motociclista',
        type: 'image/jpeg',
      },
      {
        url: 'https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_500,h_500/Logo_BSK_Motorcycle_Team_ggdyrl.png',
        width: 500,
        height: 500,
        alt: 'Logo oficial BSK Motorcycle Team - Motoclub Colombia',
        type: 'image/png',
      },
    ],
  },

  // Twitter
  twitter: {
    handle: '@bskmotorcycleteam',
    site: '@bskmotorcycleteam',
    cardType: 'summary_large_image',
  },

  // Additional
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png',
      sizes: '192x192',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],

  // Robots
  robotsProps: {
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    noarchive: false,
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1,
  },
};

/**
 * SEO configurations for specific pages
 */
export const PAGE_SEO = {
  home: {
    title: 'Inicio - BSK Motorcycle Team | Motoclub #1 en Colombia',
    description: '🏍️ BSK Motorcycle Team: El motoclub más grande de Colombia. +500 moteros unidos por la pasión, +100 rutas épicas realizadas, eventos cada semana, talleres especializados y hermandad verdadera. Únete a la familia BSK MT en Bogotá y vive la aventura sobre dos ruedas.',
    canonical: SITE_URL,
    openGraph: {
      url: SITE_URL,
      title: 'BSK Motorcycle Team | El Motoclub #1 de Colombia con +500 Miembros',
      description: '🏍️ El motoclub más grande de Colombia te espera. Comunidad de +500 moteros, +100 rutas épicas, eventos semanales, talleres profesionales y asistencia en ruta 24/7. ¡Vive la pasión sobre dos ruedas con BSK MT!',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg',
          width: 1200,
          height: 630,
          alt: 'BSK Motorcycle Team - Comunidad de +500 moteros unidos por la pasión motociclista en Colombia',
        },
      ],
    },
  },
  
  about: {
    title: 'Sobre Nosotros - Historia, Misión y Valores | BSK Motorcycle Team',
    description: 'Conoce la historia, misión, visión y valores de BSK Motorcycle Team. Fundados en 2022, somos más que un motoclub, somos una familia apasionada por el motociclismo en Colombia. Descubre nuestros logros, eventos benéficos y compromiso con la comunidad motera.',
    canonical: `${SITE_URL}/about`,
    openGraph: {
      url: `${SITE_URL}/about`,
      title: 'Sobre Nosotros - BSK Motorcycle Team | Historia y Valores del Motoclub',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_About_Team_Photo.jpg',
          width: 1200,
          height: 630,
          alt: 'Equipo BSK Motorcycle Team - Historia y valores del motoclub',
        },
      ],
    },
  },
  
  events: {
    title: 'Eventos y Rutas en Moto | BSK Motorcycle Team Colombia',
    description: '🏍️ Descubre los próximos eventos y rutas épicas de BSK Motorcycle Team. Rodadas semanales, viajes por Colombia, tours andinos, eventos benéficos y más. Únete como miembro para acceder a todos los detalles y reservar tu cupo.',
    canonical: `${SITE_URL}/events`,
    openGraph: {
      url: `${SITE_URL}/events`,
      title: 'Eventos y Rutas en Moto 2025 | BSK Motorcycle Team',
      description: 'Próximas rodadas, viajes y eventos motociclísticos en Colombia. Únete a +500 moteros en aventuras épicas cada semana.',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Events_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Eventos BSK Motorcycle Team - Rutas en moto por Colombia',
        },
      ],
    },
  },
  
  store: {
    title: 'Tienda Oficial BSK Motorcycle Team | Merchandising y Accesorios',
    description: '🏍️ Compra productos oficiales BSK Motorcycle Team. Camisetas, chaquetas, cascos, accesorios para moto y más. Merchandising exclusivo del motoclub #1 de Colombia. Envíos a toda Colombia.',
    canonical: `${SITE_URL}/store`,
    openGraph: {
      url: `${SITE_URL}/store`,
      title: 'Tienda BSK MT | Productos Oficiales del Motoclub',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Store_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Tienda oficial BSK Motorcycle Team - Merchandising',
        },
      ],
    },
  },
  
  memberships: {
    title: 'Membresías BSK Motorcycle Team | Únete al Motoclub #1 de Colombia',
    description: '🏍️ Descubre las membresías de BSK Motorcycle Team. Planes Amigo, Rider, y Elite con beneficios exclusivos: descuentos en talleres, asistencia en ruta 24/7, eventos exclusivos, merchandising oficial y más. ¡Únete a +500 moteros!',
    canonical: `${SITE_URL}/memberships`,
    openGraph: {
      url: `${SITE_URL}/memberships`,
      title: 'Membresías BSK MT | Beneficios Exclusivos para Moteros',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Memberships_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Membresías BSK Motorcycle Team - Planes y beneficios',
        },
      ],
    },
  },
  
  courses: {
    title: 'Cursos de Motociclismo | Pilotaje, Mantenimiento y Seguridad Vial',
    description: '🏍️ Cursos profesionales de BSK Motorcycle Team: Pilotaje básico, pilotaje defensivo avanzado, mantenimiento de motocicletas, rodadas grupales seguras. Aprende de los expertos y mejora tus habilidades en moto. Certificación incluida.',
    canonical: `${SITE_URL}/courses`,
    openGraph: {
      url: `${SITE_URL}/courses`,
      title: 'Cursos de Motociclismo BSK MT | Mejora tus Habilidades',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Courses_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Cursos de motociclismo BSK Motorcycle Team',
        },
      ],
    },
  },
  
  contact: {
    title: 'Contacto BSK Motorcycle Team | Comunícate con Nosotros',
    description: '📞 Contáctanos: +57 312 519 2000 | 📧 info@bskmt.com | 📍 Bogotá, Colombia. Formulario de contacto, PQRSDF, denuncias anónimas. Horario de atención: Lun-Dom 8:00-20:00. ¡Estamos para servirte!',
    canonical: `${SITE_URL}/contact`,
    openGraph: {
      url: `${SITE_URL}/contact`,
      title: 'Contacto BSK Motorcycle Team | Escríbenos',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Contact_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Contacto BSK Motorcycle Team',
        },
      ],
    },
  },
  
  sos: {
    title: 'Asistencia en Ruta 24/7 | SOS BSK Motorcycle Team',
    description: '🆘 Servicio de emergencia en ruta 24/7 para miembros BSK MT. Asistencia mecánica, auxilio vial, grúa para motos, primeros auxilios. Llamada de emergencia: +57 312 519 2000. Cobertura en toda Colombia.',
    canonical: `${SITE_URL}/sos`,
    openGraph: {
      url: `${SITE_URL}/sos`,
      title: 'SOS BSK MT | Asistencia 24/7 para Moteros',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_SOS_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Asistencia en ruta BSK Motorcycle Team',
        },
      ],
    },
  },
  
  weather: {
    title: 'Clima para Motociclistas | Pronóstico BSK Motorcycle Team',
    description: '🌤️ Consulta el clima antes de tu rodada. Pronóstico del tiempo en tiempo real para rutas motociclísticas en Colombia. Temperatura, lluvia, viento y visibilidad. Planifica tu viaje seguro con BSK MT.',
    canonical: `${SITE_URL}/weather`,
    openGraph: {
      url: `${SITE_URL}/weather`,
      title: 'Clima para Rutas en Moto | BSK Motorcycle Team',
      images: [
        {
          url: 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Weather_Hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Pronóstico del clima BSK Motorcycle Team',
        },
      ],
    },
  },
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumb = (items: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQ = (faqs: { question: string; answer: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate Event structured data
 */
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: { name: string; address: string; city: string; country: string };
  image?: string;
  price?: number;
  organizer?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressCountry: event.location.country,
      },
    },
    image: event.image || 'https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Events_Hero.jpg',
    organizer: {
      '@type': 'Organization',
      name: event.organizer || 'BSK Motorcycle Team',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: event.price || 0,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/events`,
    },
  };
};

/**
 * Generate Course structured data
 */
export const generateCourseSchema = (course: {
  name: string;
  description: string;
  provider: string;
  price: number;
  duration: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider,
      sameAs: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'COP',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      duration: course.duration,
    },
  };
};

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION };
