'use client';

import React, { Suspense } from "react";
import { useEvents } from "@/hooks/useEvents";
import { 
  LazyGallerySection, 
  LazyEventsSection, 
  LazyBlogSection, 
  LazyTestimonials, 
  LazyStoreSection,
  useIntersectionObserver 
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

export default function HomeContent() {
  const { events, loading, error } = useEvents();
  const { shouldLazyLoad, shouldPreloadImages } = useAdaptiveLoading();
  const { isMobile } = useDeviceInfo();

  // Referencias para intersection observer de secciones críticas
  const [aboutRef, aboutVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [benefitsRef, benefitsVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [faqRef, faqVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Indicadores de estado de conexión */}
      <OfflineIndicator />
      <SlowConnectionIndicator />
      
      {/* Sección About - Crítica, carga inmediata */}
      <section ref={aboutRef}>
        {aboutVisible || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonCard className="h-96" />}>
            <AboutSection />
          </Suspense>
        ) : (
          <SkeletonCard className="h-96" />
        )}
      </section>

      {/* Sección Events - Optimizada con lazy component */}
      <section>
        <LazyEventsSection 
          events={events} 
          loading={loading} 
          error={error} 
        />
      </section>

      {/* Sección Gallery - Lazy loading con optimización móvil */}
      <section>
        <LazyGallerySection />
      </section>

      {/* Sección Benefits */}
      <section ref={benefitsRef}>
        {benefitsVisible || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonCard className="h-64" />}>
            <BenefitsSection />
          </Suspense>
        ) : (
          <SkeletonCard className="h-64" />
        )}
      </section>

      {/* Sección Store - Solo en desktop o conexión buena */}
      {(!isMobile || shouldPreloadImages) && (
        <section>
          <LazyStoreSection />
        </section>
      )}

      {/* Sección Blog */}
      <section>
        <LazyBlogSection />
      </section>

      {/* Sección FAQ */}
      <section ref={faqRef}>
        {faqVisible || !shouldLazyLoad ? (
          <Suspense fallback={<SkeletonText className="h-48" />}>
            <FAQSection />
          </Suspense>
        ) : (
          <SkeletonText className="h-48" />
        )}
      </section>

      {/* Testimonials - Solo para desktop */}
      {!isMobile && (
        <section>
          <LazyTestimonials />
        </section>
      )}
    </div>
  );
}
