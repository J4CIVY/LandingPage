import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CookieBanner from "@/components/shared/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BSK Motorcycle Team",
  description: "Sitio web oficial de BSK Motorcycle Team",
};

import { ThemeProvider } from '@/providers/ThemeProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-co" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.bskmt.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-black dark:text-white`}>
        <ThemeProvider>
          <Header className="fixed top-0 left-0 right-0 z-50" />
          <main className="pt-[63px] min-h-[calc(86vh-63px)] relative pb-20">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
