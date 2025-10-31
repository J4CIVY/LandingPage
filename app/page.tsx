import React from "react";
import HeroSection from "@/components/home/HeroSection";
import HomeContent from "@/components/home/HomeContent";
import CachedHomeContent from "@/components/home/CachedHomeContent";
import type { Metadata } from 'next';

// Feature flag for cached components (Next.js 16 + React 19)
const USE_CACHED_COMPONENTS = process.env.NEXT_PUBLIC_USE_CACHE === 'true' || true;

export const metadata: Metadata = {
  title: "Inicio - BSK Motorcycle Team | Motoclub #1 en Colombia",
  description: "🏍️ BSK Motorcycle Team: El motoclub más grande de Colombia. +500 moteros unidos por la pasión, +100 rutas épicas realizadas, eventos cada semana, talleres especializados y hermandad verdadera. Únete a la familia BSK MT en Bogotá y vive la aventura sobre dos ruedas.",
  keywords: [
    "BSK Motorcycle Team", 
    "motoclub Colombia", 
    "comunidad motera Bogotá", 
    "club de motociclistas", 
    "eventos motociclismo Colombia", 
    "rutas en moto Colombia", 
    "mejor motoclub Colombia",
    "club de motos Bogotá", 
    "motos en Bogotá",
    "hermandad motera",
    "viajes en moto Colombia",
    "mototurismo Colombia",
    "talleres de motociclismo",
    "seguridad vial motos",
    "asistencia motos 24/7"
  ],
  openGraph: {
    title: "BSK Motorcycle Team | El Motoclub #1 de Colombia con +500 Miembros",
    description: "🏍️ El motoclub más grande de Colombia te espera. Comunidad de +500 moteros, +100 rutas épicas, eventos semanales, talleres profesionales y asistencia en ruta 24/7. ¡Vive la pasión sobre dos ruedas con BSK MT!",
    url: "https://bskmt.com",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg",
        width: 1200,
        height: 630,
        alt: "BSK Motorcycle Team - Comunidad de +500 moteros unidos por la pasión motociclista en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BSK Motorcycle Team | Motoclub #1 de Colombia",
    description: "🏍️ +500 miembros, +100 rutas, eventos semanales. La comunidad motera más grande de Colombia. Únete a BSK MT y vive la hermandad sobre dos ruedas.",
    images: ["https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg"],
  },
  alternates: {
    canonical: "https://bskmt.com",
    languages: {
      'es-CO': 'https://bskmt.com',
      'es': 'https://bskmt.com',
    },
  },
};

// Componente base sin analytics
const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      {USE_CACHED_COMPONENTS ? <CachedHomeContent /> : <HomeContent />}
    </>
  );
};

// Componente con analytics para producción
const HomeProduction: React.FC = () => {
  return (
    <>
      <HeroSection />
      {USE_CACHED_COMPONENTS ? <CachedHomeContent /> : <HomeContent />}
    </>
  );
};

// Exportar componente con analytics solo en producción
export default process.env.NODE_ENV === 'production' ? HomeProduction : Home;
