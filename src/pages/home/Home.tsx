import React, { Suspense } from "react";
import { useEvents } from "./hooks/useEvents";
import SEOComponent from "./components/SEOComponent";
import HeroSection from "./components/HeroSection";

const AboutSection = React.lazy(() => import("./components/AboutSection"));
const EventsSection = React.lazy(() => import("./components/EventsSection"));
const GallerySection = React.lazy(() => import("./components/GallerySection"));
const BenefitsSection = React.lazy(() => import("./components/BenefitsSection"));
const StoreSection = React.lazy(() => import("./components/StoreSection"));
const BlogSection = React.lazy(() => import("./components/BlogSection"));
const FAQSection = React.lazy(() => import("./components/FAQSection"));

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