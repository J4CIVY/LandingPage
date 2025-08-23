import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Eventos y Rutas - Próximas Aventuras",
  description: "Descubre los próximos eventos, rutas y aventuras de BSK Motorcycle Team. Tours, talleres, encuentros y actividades para toda la comunidad motera de Colombia.",
  keywords: ["eventos BSK", "rutas en moto", "tours motociclismo", "encuentros moteros", "actividades BSK", "calendario eventos", "rutas Colombia"],
  openGraph: {
    title: "Eventos y Rutas - BSK Motorcycle Team",
    description: "Descubre los próximos eventos, rutas y aventuras de BSK Motorcycle Team. Tours, talleres, encuentros y actividades para toda la comunidad motera.",
    url: "https://bskmt.com/events",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/BSK_Events_Hero.jpg",
        width: 1200,
        height: 630,
        alt: "Eventos BSK Motorcycle Team - Rutas y aventuras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos y Rutas - BSK Motorcycle Team",
    description: "Descubre los próximos eventos, rutas y aventuras de BSK Motorcycle Team. Tours, talleres, encuentros y actividades.",
  },
  alternates: {
    canonical: "https://bskmt.com/events",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
