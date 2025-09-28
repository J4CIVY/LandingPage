/**
 * Componentes lazy para optimización de rendimiento
 * Permite la carga diferida de componentes pesados y mejora el tiempo de carga inicial
 */

'use client';

import { lazy, Suspense, ComponentType, useState, useEffect, Component, ReactNode } from 'react';
import { SkeletonCard, SkeletonEvent, SkeletonProduct, SkeletonText } from '../shared/SkeletonLoaders';

// ErrorBoundary simple para lazy components
class ErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Wrapper para componentes lazy con skeleton mejorado
export function withLazyLoading<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  SkeletonComponent: ComponentType = SkeletonCard,
  options: {
    preload?: boolean;
    timeout?: number;
    retryCount?: number;
  } = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    const [retryCount, setRetryCount] = useState(0);
    const [hasError, setHasError] = useState(false);
    
    // Preload en hover si está habilitado
    useEffect(() => {
      if (options.preload) {
        const timer = setTimeout(() => {
          importFunc().catch(console.warn);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, []);

    const handleRetry = () => {
      if (retryCount < (options.retryCount || 3)) {
        setRetryCount(prev => prev + 1);
        setHasError(false);
      }
    };

    if (hasError) {
      return (
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-red-500 dark:text-red-300 mb-2">Error cargando componente</p>
          {retryCount < (options.retryCount || 3) && (
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800"
            >
              Reintentar
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="lazy-container prevent-layout-shift bg-white dark:bg-gray-800">
        <Suspense 
          fallback={
            <div className="stable-height bg-white dark:bg-gray-800">
              <SkeletonComponent />
            </div>
          }
        >
          <ErrorBoundary onError={() => setHasError(true)}>
            <LazyComponent {...(props as any)} key={retryCount} />
          </ErrorBoundary>
        </Suspense>
      </div>
    );
  };
}

// Componentes lazy específicos para secciones pesadas
export const LazyAboutSection = withLazyLoading(
  () => import('../home/AboutSection'),
  SkeletonCard
);

export const LazyGallerySection = withLazyLoading(
  () => import('../home/GallerySection'),
  SkeletonCard
);

export const LazyBenefitsSection = withLazyLoading(
  () => import('../home/BenefitsSection'),
  SkeletonCard
);

export const LazyFAQSection = withLazyLoading(
  () => import('../home/FAQSection'),
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
  LazyBenefitsSection,
  LazyFAQSection,
  LazyEventsSection,
  LazyBlogSection,
  LazyStoreSection,
  withLazyLoading,
  useIsMobile,
  useIntersectionObserver,
};
