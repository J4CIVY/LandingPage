'use client';

import React, { Suspense } from "react";
import { useEvents } from "@/hooks/useEvents";
import SEOComponent from "@/components/home/SEOComponent";
import HeroSection from "@/components/home/HeroSection";

const AboutSection = React.lazy(() => import("@/components/home/AboutSection"));
const EventsSection = React.lazy(() => import("@/components/home/EventsSection"));
const GallerySection = React.lazy(() => import("@/components/home/GallerySection"));
const BenefitsSection = React.lazy(() => import("@/components/home/BenefitsSection"));
const StoreSection = React.lazy(() => import("@/components/home/StoreSection"));
const BlogSection = React.lazy(() => import("@/components/home/BlogSection"));
const FAQSection = React.lazy(() => import("@/components/home/FAQSection"));

const Home: React.FC = () => {
  const { events, loading, error } = useEvents();

  return (
    <>
      <SEOComponent
        title="BSK Motorcycle Team - Club de Motociclistas en Colombia"
        description="Únete a BSK Motorcycle Team, una comunidad de apasionados por las motos en Colombia. Participa en eventos, rutas y disfruta de beneficios exclusivos."
      />
      <div className="min-h-screen bg-[#ffffff]">
        <HeroSection />
        <Suspense fallback={<div>Loading...</div>}>
          <AboutSection />
          <EventsSection 
            events={events} 
            loading={loading} 
            error={error} 
          />
          <GallerySection />
          <BenefitsSection />
          <StoreSection />
          <BlogSection />
          <FAQSection />
        </Suspense>
      </div>
    </>
  );
};

export default Home;
