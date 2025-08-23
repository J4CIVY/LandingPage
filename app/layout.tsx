import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CookieBanner from "@/components/shared/CookieBanner";
import DynamicThemeColor from "@/components/shared/DynamicThemeColor";
import StructuredData from "@/components/shared/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BSK Motorcycle Team - Motoclub Líder en Colombia",
    template: "%s | BSK Motorcycle Team"
  },
  description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo. Hermandad, aventura y respeto sobre dos ruedas.",
  keywords: ["motoclub en bogotá", "motoclub en colombia", "bskmt", "bsk mt", "bsk motorcycle team", "comunidad motera", "rutas en moto bogotá", "eventos motociclismo", "club de motos colombia", "mototurismo", "talleres motociclismo"],
  authors: [{ name: "BSK Motorcycle Team" }],
  creator: "BSK Motorcycle Team",
  publisher: "BSK Motorcycle Team",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://bskmt.com",
    siteName: "BSK Motorcycle Team",
    title: "BSK Motorcycle Team - Motoclub Líder en Colombia",
    description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo.",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png",
        width: 1200,
        height: 630,
        alt: "BSK Motorcycle Team - Logo oficial del motoclub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bskmotorcycleteam",
    creator: "@bskmotorcycleteam",
    title: "BSK Motorcycle Team - Motoclub Líder en Colombia",
    description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Disfruta de rutas, eventos, talleres y una comunidad apasionada por el motociclismo.",
    images: ["https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png"],
  },
  alternates: {
    canonical: "https://bskmt.com",
  },
  verification: {
    google: "your-google-verification-code", // Agregar cuando esté disponible
  },
};

import { ThemeProvider } from '@/providers/ThemeProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://api.bskmt.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
        <StructuredData type="organization" data={{}} />
        <StructuredData type="localBusiness" data={{}} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <DynamicThemeColor />
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
