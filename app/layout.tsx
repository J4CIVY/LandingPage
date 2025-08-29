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
  metadataBase: new URL('https://bskmt.com'),
  title: {
    default: "BSK Motorcycle Team - Motoclub Líder en Colombia",
    template: "%s | BSK Motorcycle Team"
  },
  description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Comunidad unida por la pasión motociclista, rutas épicas, eventos emocionantes, talleres especializados y el espíritu aventurero sobre dos ruedas.",
  keywords: [
    // Palabras clave principales
    "BSK Motorcycle Team", "motoclub colombia", "motoclub bogotá", 
    // Long tail keywords específicas
    "comunidad motera colombia", "rutas en moto bogotá", "eventos motociclismo colombia",
    "club motocicletas bogotá", "mototurismo colombia", "talleres motociclismo bogotá",
    // Keywords de ubicación
    "motoclones bogotá", "bikers colombia", "moteros bogotá", "moto grupo colombia",
    // Keywords de servicios
    "cursos conducción moto", "mantenimiento motocicletas", "seguridad vial motos"
  ],
  authors: [{ name: "BSK Motorcycle Team", url: "https://bskmt.com" }],
  creator: "BSK Motorcycle Team",
  publisher: "BSK Motorcycle Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Sports & Recreation',
  classification: 'Motorcycle Club',
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
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
    title: "BSK Motorcycle Team - El Motoclub Líder en Colombia",
    description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Comunidad unida por la pasión motociclista, rutas épicas, eventos emocionantes y el espíritu aventurero sobre dos ruedas.",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/og-image-bsk-motorcycle-team.jpg",
        width: 1200,
        height: 630,
        alt: "BSK Motorcycle Team - Motoclub líder en Colombia con comunidad unida por la pasión motociclista",
        type: "image/jpeg",
      },
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/Logo_BSK_Motorcycle_Team_ggdyrl.png",
        width: 500,
        height: 500,
        alt: "Logo BSK Motorcycle Team",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bskmotorcycleteam",
    creator: "@bskmotorcycleteam",
    title: "BSK Motorcycle Team - El Motoclub Líder en Colombia",
    description: "Únete a BSK Motorcycle Team, el motoclub líder en Colombia. Comunidad unida por la pasión motociclista, rutas épicas y el espíritu aventurero sobre dos ruedas.",
    images: ["https://res.cloudinary.com/dz0peilmu/image/upload/v1700000000/og-image-bsk-motorcycle-team.jpg"],
  },
  alternates: {
    canonical: "https://bskmt.com",
    languages: {
      'es-CO': 'https://bskmt.com',
      'es': 'https://bskmt.com',
    },
  },
  verification: {
    google: "05957975579128883654",
    yandex: "verification_code_yandex",
    yahoo: "verification_code_yahoo",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BSK MT',
    'application-name': 'BSK Motorcycle Team',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#000000',
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
        {/* Preload critical resources */}
        <link rel="preload" href="/Logo_Letras_BSK_MT_500x500.webp" as="image" type="image/webp" />
        <link rel="preload" href="https://res.cloudinary.com/dz0peilmu/image/upload/q_auto:best,c_fill,g_auto,f_webp,w_1366/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql" as="image" type="image/webp" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//api.bskmt.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.bskmt.com" crossOrigin="anonymous" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png" />
        <link rel="icon" type="image/webp" sizes="192x192" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.webp" />
        
        {/* Optimizaciones para móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=yes, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BSK MT" />
        
        {/* Performance optimizations */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Optimización viewport height para mobile */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --vh: 1vh;
              --safe-area-inset-top: env(safe-area-inset-top);
              --safe-area-inset-bottom: env(safe-area-inset-bottom);
              --safe-area-inset-left: env(safe-area-inset-left);
              --safe-area-inset-right: env(safe-area-inset-right);
            }
            @supports (-webkit-touch-callout: none) {
              :root {
                --vh: calc(100vh - env(safe-area-inset-bottom));
              }
            }
            /* Critical CSS para layout shift prevención */
            .prevent-cls {
              contain: layout style paint;
              content-visibility: auto;
            }
            /* Optimizar reflow y repaint */
            .gpu-accelerated {
              contain: layout style paint;
              will-change: auto;
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
        <StructuredData type="website" data={{}} />
        <StructuredData type="motorcycleClub" data={{}} />
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
