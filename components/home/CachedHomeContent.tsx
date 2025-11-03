/**
 * Optimized Home Content Component with Cached Components
 * 
 * This version uses React 19's 'use cache' directive components
 * for better performance and reduced server load.
 * 
 * Benefits:
 * - Server Components are cached across requests
 * - Automatic revalidation based on cache configuration
 * - Reduced database queries and API calls
 * - Faster page loads for users
 */

import { Suspense, lazy } from "react";
import CachedAboutSection from "@/components/home/CachedAboutSection";
import CachedBenefitsSection from "@/components/home/CachedBenefitsSection";
import CachedEventsSection from "@/components/home/CachedEventsSection";
import { SkeletonCard } from "@/components/shared/SkeletonLoaders";

// Lazy load less critical sections
const LazyGallerySection = lazy(() => import("@/components/home/GallerySection"));
const LazyFAQSection = lazy(() => import("@/components/home/FAQSection"));
const LazyStoreSection = lazy(() => import("@/components/home/StoreSection"));
const LazyBlogSection = lazy(() => import("@/components/home/BlogSection"));
const HermandadSection = lazy(() => import("@/components/home/HermandadSection"));

export default function CachedHomeContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* About Section - Cached */}
      <Suspense fallback={<SkeletonCard className="h-96" />}>
        <CachedAboutSection />
      </Suspense>

      {/* Events Section - Cached with revalidation */}
      <Suspense fallback={<SkeletonCard className="h-96 bg-gray-50 dark:bg-slate-900" />}>
        <CachedEventsSection />
      </Suspense>

      {/* Gallery Section - Lazy loaded */}
      <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <Suspense fallback={<SkeletonCard className="h-96" />}>
          <LazyGallerySection />
        </Suspense>
      </section>

      {/* Benefits Section - Cached */}
      <Suspense fallback={<SkeletonCard className="h-96 bg-gray-50 dark:bg-slate-900" />}>
        <CachedBenefitsSection />
      </Suspense>

      {/* Hermandad Section - Lazy loaded */}
      <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <Suspense fallback={<SkeletonCard className="h-96" />}>
          <HermandadSection />
        </Suspense>
      </section>

      {/* FAQ Section - Lazy loaded */}
      <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
        <Suspense fallback={<SkeletonCard className="h-96" />}>
          <LazyFAQSection />
        </Suspense>
      </section>

      {/* Store Section - Lazy loaded */}
      <section className="lazy-container intersection-stable bg-white dark:bg-slate-950">
        <Suspense fallback={<SkeletonCard className="h-96" />}>
          <LazyStoreSection />
        </Suspense>
      </section>

      {/* Blog Section - Lazy loaded */}
      <section className="lazy-container intersection-stable bg-gray-50 dark:bg-slate-900">
        <Suspense fallback={<SkeletonCard className="h-96" />}>
          <LazyBlogSection />
        </Suspense>
      </section>
    </div>
  );
}
