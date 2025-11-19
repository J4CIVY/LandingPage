'use client';

import { Suspense, lazy } from "react";
import { useEvents } from "@/hooks/useEvents";
import { 
  LazyAboutSection,
  LazyGallerySection,
  LazyBenefitsSection,
  LazyFAQSection,
  LazyEventsSection, 
  LazyBlogSection, 
  LazyStoreSection
} from "@/components/performance/LazyComponents";
import { SkeletonCard } from "@/components/shared/SkeletonLoaders";
import { 
  OfflineIndicator, 
  SlowConnectionIndicator,
  useDeviceInfo 
} from "@/components/performance/MobileOptimizations";

const HermandadSection = lazy(() => import("@/components/home/HermandadSection"));

export default function HomeContent() {
  const { events, loading, error } = useEvents(true, 6); // Solo eventos futuros, máximo 6
  const { isMobile } = useDeviceInfo();

  return (
  <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Indicadores de estado de conexión */}
      <OfflineIndicator />
      <SlowConnectionIndicator />
      
  {/* Sección About */}
  <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <LazyAboutSection />
        </Suspense>
      </section>

  {/* Sección Events */}
  <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
        <LazyEventsSection 
          events={events} 
          loading={loading} 
          error={error} 
        />
      </section>

  {/* Sección Gallery */}
  <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <LazyGallerySection />
      </section>

  {/* Sección Benefits */}
  <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <LazyBenefitsSection />
        </Suspense>
      </section>

  {/* Sección Hermandad */}
  <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <HermandadSection />
        </Suspense>
      </section>

      {/* Sección Store */}
            {/* Lazy load non-critical sections */}
      {(!isMobile) && (
        <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
          <LazyStoreSection />
        </section>
      )}

      {/* Sección Blog */}
      <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <LazyBlogSection />
      </section>

      {/* Sección FAQ */}
      <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
        <LazyFAQSection />
      </section>
    </div>
  );
}
