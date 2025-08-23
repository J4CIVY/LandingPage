'use client';

import React, { Suspense, useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { 
  LazyGallerySection, 
  LazyEventsSection, 
  LazyBlogSection, 
  LazyTestimonials, 
  LazyStoreSection
} from "@/components/performance/LazyComponents";
import { SkeletonCard, SkeletonEvent, SkeletonText } from "@/components/shared/SkeletonLoaders";
import { 
  useAdaptiveLoading, 
  OfflineIndicator, 
  SlowConnectionIndicator,
  useDeviceInfo 
} from "@/components/performance/MobileOptimizations";

const AboutSection = React.lazy(() => import("@/components/home/AboutSection"));
const BenefitsSection = React.lazy(() => import("@/components/home/BenefitsSection"));
const FAQSection = React.lazy(() => import("@/components/home/FAQSection"));
const ComunidadSection = React.lazy(() => import("@/components/home/ComunidadSection"));

export default function HomeContent() {
  const { events, loading, error } = useEvents();
  const { shouldLazyLoad, shouldPreloadImages } = useAdaptiveLoading();
  const { isMobile } = useDeviceInfo();

  // Estados para evitar parpadeo - una vez cargado, no volver a ocultar
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const [benefitsLoaded, setBenefitsLoaded] = useState(false);
  const [faqLoaded, setFaqLoaded] = useState(false);

  // Hook simplificado para detectar cuando secciones entran en viewport
  useEffect(() => {
    const options = {
      threshold: 0.1,
      rootMargin: '100px', // Aumentamos el margen para carga anticipada
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          
          switch (sectionId) {
            case 'about':
              setAboutLoaded(true);
              break;
            case 'benefits':
              setBenefitsLoaded(true);
              break;
            case 'faq':
              setFaqLoaded(true);
              break;
          }
        }
      });
    }, options);

    // Observar secciones después del montaje
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Indicadores de estado de conexión */}
      <OfflineIndicator />
      <SlowConnectionIndicator />
      
      {/* Sección About - Evitar parpadeo */}
      <section data-section="about" className="stable-height intersection-stable">
        {aboutLoaded || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonCard className="h-96" />}>
            <AboutSection />
          </Suspense>
        ) : (
          <SkeletonCard className="h-96" />
        )}
      </section>

      {/* Sección Events - Siempre cargar inmediatamente */}
      <section className="lazy-container intersection-stable">
        <LazyEventsSection 
          events={events} 
          loading={loading} 
          error={error} 
        />
      </section>

      {/* Sección Gallery - Cargar inmediatamente sin lazy observer */}
      <section className="lazy-container intersection-stable">
        <LazyGallerySection />
      </section>

      {/* Sección Benefits - Evitar parpadeo */}
      <section data-section="benefits" className="stable-height intersection-stable">
        {benefitsLoaded || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonCard className="h-64" />}>
            <BenefitsSection />
          </Suspense>
        ) : (
          <SkeletonCard className="h-64" />
        )}
      </section>

      {/* Sección Comunidad - Nueva sección emocional */}
      <section className="lazy-container intersection-stable">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <ComunidadSection />
        </Suspense>
      </section>

      {/* Sección Store - Cargar inmediatamente */}
      {(!isMobile || shouldPreloadImages) && (
        <section className="lazy-container intersection-stable">
          <LazyStoreSection />
        </section>
      )}

      {/* Sección Blog - Cargar inmediatamente */}
      <section className="lazy-container intersection-stable">
        <LazyBlogSection />
      </section>

      {/* Sección FAQ - Evitar parpadeo */}
      <section data-section="faq" className="stable-height intersection-stable">
        {faqLoaded || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonText className="h-48" />}>
            <FAQSection />
          </Suspense>
        ) : (
          <SkeletonText className="h-48" />
        )}
      </section>

      {/* Testimonials - Solo para desktop */}
      {!isMobile && (
        <section className="lazy-container intersection-stable">
          <LazyTestimonials />
        </section>
      )}
    </div>
  );
}
