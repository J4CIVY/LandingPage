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
    default: "BSK Motorcycle Team - Motoclub en Colombia | Comunidad Motera Colombia",
    template: "%s | BSK Motorcycle Team - Motoclub en Colombia"
  },
  description: "🏍️ Únete al motoclub #1 de Colombia. +50 miembros activos, +100 rutas épicas, eventos semanales, talleres especializados y hermandad verdadera. Comunidad BSK MT en Bogotá donde la pasión motociclista se vive sobre dos ruedas.",
  keywords: [
    // Palabras clave principales
    "BSK Motorcycle Team", "motoclub colombia", "motoclub bogotá", "BSKMT",
    // Long tail keywords específicas
    "mejor motoclub colombia", "comunidad motera colombia", "club de motos bogotá",
    "rutas en moto bogotá", "eventos motociclismo colombia", "viajes en moto colombia",
    "club motocicletas bogotá", "mototurismo colombia", "talleres motociclismo bogotá",
    "escuela de motociclismo", "cursos manejo moto colombia",
    // Keywords de ubicación
    "motoclones bogotá", "bikers colombia", "moteros bogotá", "moto club colombia",
    "grupos de motos bogotá", "comunidad biker colombia",
    // Keywords de servicios
    "cursos conducción moto", "mantenimiento motocicletas", "seguridad vial motos",
    "membresías motoclub", "beneficios motoclub", "asistencia en ruta",
    // Keywords de intención
    "como unirse a un motoclub", "mejor club de motos colombia", "motoclub cerca de mi",
    "eventos motos colombia 2025", "rutas motociclistas colombia"
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
    title: "BSK Motorcycle Team - El Motoclub #1 de Colombia",
    description: "🏍️ El motoclub más grande de Colombia. Comunidad de moteros unidos por la pasión. Rutas épicas cada semana, eventos exclusivos, talleres profesionales y asistencia 24/7. ¡Únete a la familia BSK MT!",
    images: [
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/og-image-bsk-motorcycle-team.jpg",
        width: 1200,
        height: 630,
        alt: "BSK Motorcycle Team - El motoclub líder en Colombia con más de 500 miembros activos, rutas épicas y comunidad unida por la pasión motociclista",
        type: "image/jpeg",
      },
      {
        url: "https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_500,h_500/Logo_BSK_Motorcycle_Team_ggdyrl.png",
        width: 500,
        height: 500,
        alt: "Logo oficial BSK Motorcycle Team - Motoclub Colombia",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bskmotorcycleteam",
    creator: "@bskmotorcycleteam",
    title: "BSK Motorcycle Team - El Motoclub #1 de Colombia",
    description: "🏍️ +500 moteros, +100 rutas, eventos semanales. La comunidad motera más grande de Colombia te espera. Únete a BSK MT y vive la pasión sobre dos ruedas.",
    images: ["https://res.cloudinary.com/dz0peilmu/image/upload/f_auto,q_auto:best,w_1200,h_630,c_fill,g_auto/og-image-bsk-motorcycle-team.jpg"],
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
    // Additional SEO meta tags
    'geo.region': 'CO-DC',
    'geo.placename': 'Bogotá',
    'geo.position': '4.562477;-74.101509',
    'ICBM': '4.562477, -74.101509',
    'language': 'es-co',
    'revisit-after': '7 days',
    'rating': 'General',
    'distribution': 'Global',
    'coverage': 'Worldwide',
    'target': 'all',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
  },
};

import { ThemeProvider } from '@/providers/ThemeProvider'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { PWAManager } from '@/components/pwa/ServiceWorkerManager'
import { AuthProvider } from '@/hooks/useAuth'
import AccessibilityHelper from '@/components/shared/AccessibilityHelper'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="">
      <head>
        {/* DNS prefetch for external domains - Performance optimization */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//api.bskmt.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Preconnect to critical third-party origins - Reduces latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.bskmt.com" />
        
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png" />
        <link rel="icon" type="image/webp" sizes="192x192" href="/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.webp" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Mobile optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=yes, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BSK MT" />
        
        {/* Performance optimizations */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Critical CSS for preventing layout shifts and optimizing initial render */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --vh: 1vh;
              --safe-area-inset-top: env(safe-area-inset-top);
              --safe-area-inset-bottom: env(safe-area-inset-bottom);
              --safe-area-inset-left: env(safe-area-inset-left);
              --safe-area-inset-right: env(safe-area-inset-right);
            }
            
            /* iOS Safari viewport fix */
            @supports (-webkit-touch-callout: none) {
              :root {
                --vh: calc(100vh - env(safe-area-inset-bottom));
              }
            }
            
            /* Prevent cumulative layout shift (CLS) */
            .prevent-cls {
              contain: layout style paint;
              content-visibility: auto;
            }
            
            /* GPU acceleration for smooth animations */
            .gpu-accelerated {
              contain: layout style paint;
              will-change: auto;
              transform: translateZ(0);
              backface-visibility: hidden;
            }
            
            /* Optimize font loading to prevent FOIT/FOUT */
            @font-face {
              font-family: 'Inter-fallback';
              src: local('Arial'), local('Helvetica'), local('system-ui');
              font-display: swap;
              ascent-override: 90%;
              descent-override: 22%;
              line-gap-override: 0%;
              size-adjust: 107%;
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
          <AuthProvider>
            <ToastProvider>
              <PWAManager />
              <DynamicThemeColor />
              <AccessibilityHelper />
              <Header />
              <main id="main-content" className="pt-16" tabIndex={-1}>{children}</main>
              <Footer />
              <CookieBanner />
              <ScrollToTop />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
