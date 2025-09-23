'use client';

import React, { Suspense, useState, useEffect } from "react";
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
import { SkeletonCard, SkeletonEvent, SkeletonText } from "@/components/shared/SkeletonLoaders";
import { 
  useAdaptiveLoading, 
  OfflineIndicator, 
  SlowConnectionIndicator,
  useDeviceInfo 
} from "@/components/performance/MobileOptimizations";

const HermandadSection = React.lazy(() => import("@/components/home/HermandadSection"));

export default function HomeContent() {
  const { events, loading, error } = useEvents(true, 6); // Solo eventos futuros, máximo 6
  const { shouldLazyLoad, shouldPreloadImages } = useAdaptiveLoading();
  const { isMobile } = useDeviceInfo();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Indicadores de estado de conexión */}
      <OfflineIndicator />
      <SlowConnectionIndicator />
      
      {/* Sección About */}
      <section className="lazy-container intersection-stable">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <LazyAboutSection />
        </Suspense>
      </section>

      {/* Sección Events */}
      <section className="lazy-container intersection-stable">
        <LazyEventsSection 
          events={events} 
          loading={loading} 
          error={error} 
        />
      </section>

      {/* Sección Gallery */}
      <section className="lazy-container intersection-stable">
        <LazyGallerySection />
      </section>

      {/* Sección Benefits */}
      <section className="lazy-container intersection-stable">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <LazyBenefitsSection />
        </Suspense>
      </section>

      {/* Sección Hermandad */}
      <section className="lazy-container intersection-stable">
        <Suspense fallback={<SkeletonCard className="h-64" />}>
          <HermandadSection />
        </Suspense>
      </section>

      {/* Sección Store */}
      {(!isMobile || shouldPreloadImages) && (
        <section className="lazy-container intersection-stable">
          <LazyStoreSection />
        </section>
      )}

      {/* Sección Blog */}
      <section className="lazy-container intersection-stable">
        <LazyBlogSection />
      </section>

      {/* Sección FAQ */}
      <section className="lazy-container intersection-stable">
        <LazyFAQSection />
      </section>
    </div>
  );
}
