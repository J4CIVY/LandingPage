/**
 * Performance Monitoring Utilities
 * Tracks Core Web Vitals and provides insights for optimization
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface PerformanceMetrics {
  CLS: number;
  INP: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

/**
 * Send metrics to analytics endpoint
 */
function sendToAnalytics(metric: Metric) {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Performance] ${metric.name}:`, metric.value, metric);
    return;
  }

  // Send to your analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(console.error);
  }
}

/**
 * Report all Web Vitals metrics
 */
export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (err) {
    console.error('[Performance] Error reporting web vitals:', err);
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): Partial<PerformanceMetrics> {
  const metrics: Partial<PerformanceMetrics> = {};

  if (typeof window === 'undefined') return metrics;

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.FCP = fcpEntry.startTime;
      }

      // Time to First Byte
      metrics.TTFB = navigation.responseStart - navigation.requestStart;
    }
  } catch (err) {
    console.error('[Performance] Error getting metrics:', err);
  }

  return metrics;
}

/**
 * Optimize image loading with Intersection Observer
 */
export function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            const srcset = img.dataset.srcset;

            if (src) {
              img.src = src;
            }
            if (srcset) {
              img.srcset = srcset;
            }

            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Prefetch critical resources
 */
export function prefetchResources(urls: string[]) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }
}

/**
 * Measure component render time
 */
export function measureComponentRender(componentName: string, callback: () => void) {
  if (process.env.NODE_ENV !== 'production') {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`[Performance] ${componentName} render time: ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Check if page is loaded from cache (BFCache)
 */
export function detectBFCache(callback: () => void) {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('[Performance] Page loaded from BFCache');
      callback();
    }
  });
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget() {
  if (typeof window === 'undefined') return;

  const budget = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    CLS: 0.1,
    FID: 100, // 100ms
    TTFB: 600, // 600ms
  };

  const metrics = getPerformanceMetrics();

  Object.entries(budget).forEach(([metric, threshold]) => {
    const value = metrics[metric as keyof PerformanceMetrics];
    if (value && value > threshold) {
      console.warn(
        `[Performance Budget] ${metric} exceeded: ${value}ms > ${threshold}ms`
      );
    }
  });
}

export default {
  reportWebVitals,
  getPerformanceMetrics,
  lazyLoadImages,
  prefetchResources,
  measureComponentRender,
  detectBFCache,
  checkPerformanceBudget,
};
