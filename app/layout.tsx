import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CookieBanner from "@/components/shared/CookieBanner";
import DynamicThemeColor from "@/components/shared/DynamicThemeColor";

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
    <html lang="es" suppressHydrationWarning className="">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://api.bskmt.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
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
