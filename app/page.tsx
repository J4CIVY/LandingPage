import React from "react";
import HeroSection from "@/components/home/HeroSection";
import HomeContent from "@/components/home/HomeContent";
import HomeWithAnalytics from "@/components/home/HomeWithAnalytics";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "BSK Motorcycle Team",
  description: "BSK Motorcycle Team, donde la amistad se vive sobre dos ruedas. Pasión por el motociclismo, espíritu aventurero y respeto en cada ruta por Colombia.",
  keywords: ["BSK Motorcycle Team", "motoclub Colombia", "comunidad motera", "eventos motociclismo", "rutas en moto", "club de motociclistas", "motos en Bogotá"],
  openGraph: {
    title: "Motoclub - BSK Motorcycle Team",
    description: "BSK Motorcycle Team, donde la amistad se vive sobre dos ruedas. Pasión por el motociclismo, espíritu aventurero y respeto en cada ruta por Colombia.",
    url: "https://bskmt.com",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql.jpg",
        width: 1200,
        height: 630,
        alt: "Motoclub - BSK Motorcycle Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motoclub - BSK Motorcycle Team",
    description: "BSK Motorcycle Team, donde la amistad se vive sobre dos ruedas. Pasión por el motociclismo, espíritu aventurero y respeto en cada ruta por Colombia.",
  },
  alternates: {
    canonical: "https://bskmt.com",
  },
};

// Componente base sin analytics
const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <HomeContent />
    </>
  );
};

// Exportar componente con analytics solo en producción
export default process.env.NODE_ENV === 'production' ? HomeWithAnalytics : Home;
