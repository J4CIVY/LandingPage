import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CookieBanner from "@/components/shared/CookieBanner";
import DynamicThemeColor from "@/components/shared/DynamicThemeColor";
import StructuredData from "@/components/shared/StructuredData";
import ScrollToTop from "@/components/shared/ScrollToTop";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "BSK Motorcycle Team - Motoclub Líder en Colombia",
    template: "%s | BSK Motorcycle Team"
  },
  description: "Únete a BSK Motorcycle Team, donde la comunidad se vive sobre dos ruedas. Disfruta de rutas, eventos, talleres y una comunidad unida por la pasión, el espíritu aventurero y el respeto mutuo.",
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
    title: "BSK Motorcycle Team - Comunidad sobre dos ruedas",
    description: "Únete a BSK Motorcycle Team, donde la comunidad se vive sobre dos ruedas. Disfruta de rutas, eventos, talleres y una comunidad unida por la pasión, el espíritu aventurero y el respeto mutuo.",
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
    title: "BSK Motorcycle Team - Comunidad sobre dos ruedas",
    description: "Únete a BSK Motorcycle Team, donde la comunidad se vive sobre dos ruedas. Disfruta de rutas, eventos, talleres y una comunidad unida por la pasión, el espíritu aventurero y el respeto mutuo.",
    images: ["https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png"],
  },
  alternates: {
    canonical: "https://bskmt.com",
  },
  verification: {
    google: "05957975579128883654",
  },
};

import { ThemeProvider } from '@/providers/ThemeProvider'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { PWAManager } from '@/components/pwa/ServiceWorkerManager'
import { StrategicPreloader, BSK_CRITICAL_RESOURCES } from '@/components/performance/StrategicPreloader'

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
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/Logo_Letras_BSK_MT_500x500.webp" as="image" />
        <link rel="preload" href="https://res.cloudinary.com/dz0peilmu/image/upload/q_auto:best,c_fill,g_auto,f_webp,w_1366/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Optimizaciones para móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BSK MT" />
        
        {/* Preload critical CSS */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        
        {/* Optimización viewport height para mobile */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --vh: 1vh;
            }
            @supports (-webkit-touch-callout: none) {
              :root {
                --vh: calc(100vh - env(safe-area-inset-bottom));
              }
            }
          `
        }} />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
        {/* Skip links para accesibilidad */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <a href="#navigation" className="skip-link">
          Saltar a navegación
        </a>
        
        <StructuredData type="organization" data={{}} />
        <StructuredData type="localBusiness" data={{}} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <ToastProvider>
            <StrategicPreloader resources={BSK_CRITICAL_RESOURCES} />
            <PWAManager />
            <DynamicThemeColor />
            <Header />
            <main id="main-content" className="pt-16" tabIndex={-1}>{children}</main>
            <Footer />
            <CookieBanner />
            <ScrollToTop />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
