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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-co"> 
      <body className={inter.className}>
        <Header className="fixed top-0 left-0 right-0 z-50" />
        <main className="pt-[76px] min-h-[calc(100vh-76px)] relative pb-20">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
