/**
 * Componentes lazy para optimización de rendimiento
 * Permite la carga diferida de componentes pesados y mejora el tiempo de carga inicial
 */

'use client';

import { lazy, Suspense, ComponentType, useState, useEffect } from 'react';
import { SkeletonCard, SkeletonEvent, SkeletonProduct, SkeletonText } from '../shared/SkeletonLoaders';

// Wrapper para componentes lazy con skeleton
export function withLazyLoading<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  SkeletonComponent: ComponentType = SkeletonCard
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<SkeletonComponent />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Componentes lazy específicos para secciones pesadas
export const LazyGallerySection = withLazyLoading(
  () => import('../home/GallerySection'),
  SkeletonCard
);

export const LazyEventsSection = withLazyLoading(
  () => import('../home/EventsSection'),
  SkeletonEvent
);

export const LazyBlogSection = withLazyLoading(
  () => import('../home/BlogSection'),
  SkeletonCard
);

export const LazyTestimonials = withLazyLoading(
  () => import('../home/Testimonials'),
  SkeletonText
);

export const LazyStoreSection = withLazyLoading(
  () => import('../home/StoreSection'),
  SkeletonProduct
);

// Hook para detectar si el usuario está en mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Hook para intersection observer optimizado
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );
    
    observer.observe(ref);
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return [setRef, isIntersecting] as const;
}

export default {
  LazyGallerySection,
  LazyEventsSection,
  LazyBlogSection,
  LazyTestimonials,
  LazyStoreSection,
  withLazyLoading,
  useIsMobile,
  useIntersectionObserver,
};
