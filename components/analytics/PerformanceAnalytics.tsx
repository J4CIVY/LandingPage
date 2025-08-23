/**
 * Sistema de analytics y métricas de performance
 * Incluye seguimiento de Core Web Vitals y eventos de usuario
 */

'use client';

import { useEffect, useCallback, useState } from 'react';

// Tipos para métricas de performance
interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface UserEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
  url: string;
  userId?: string;
}

// Hook para métricas de Core Web Vitals
export function useCoreWebVitals() {
  const sendMetric = useCallback((metric: any) => {
    // Adaptar métrica de web-vitals a nuestro formato
    const adaptedMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // En producción, enviar a Google Analytics o servicio de métricas
    if (process.env.NODE_ENV === 'production') {
      console.log('Core Web Vital:', adaptedMetric);
    }
  }, []);

  useEffect(() => {
    // Lazy load web-vitals library
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(sendMetric);
      onFCP(sendMetric);
      onLCP(sendMetric);
      onTTFB(sendMetric);
      onINP(sendMetric);
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
  }, [sendMetric]);
}

// Hook para tracking de eventos de usuario
export function useAnalytics() {
  const trackEvent = useCallback((event: Omit<UserEvent, 'timestamp' | 'url'>) => {
    const eventData: UserEvent = {
      ...event,
      timestamp: Date.now(),
      url: window.location.href,
    };

    // En producción, enviar a Google Analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', event.event, {
      //   event_category: event.category,
      //   event_label: event.label,
      //   value: event.value,
      // });
    }

    console.log('User Event:', eventData);
  }, []);

  const trackPageView = useCallback((page: string) => {
    if (process.env.NODE_ENV === 'production') {
      // gtag('config', 'GA_MEASUREMENT_ID', {
      //   page_title: document.title,
      //   page_location: window.location.href,
      // });
    }
    
    console.log('Page View:', page);
  }, []);

  const trackConversion = useCallback((conversionId: string, value?: number) => {
    trackEvent({
      event: 'conversion',
      category: 'goals',
      label: conversionId,
      value,
    });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent({
      event: 'form_submit',
      category: 'forms',
      label: `${formName}_${success ? 'success' : 'error'}`,
      value: success ? 1 : 0,
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, section: string) => {
    trackEvent({
      event: 'button_click',
      category: 'engagement',
      label: `${section}_${buttonName}`,
    });
  }, [trackEvent]);

  const trackScrollDepth = useCallback((depth: number) => {
    trackEvent({
      event: 'scroll_depth',
      category: 'engagement',
      label: `${depth}%`,
      value: depth,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackFormSubmission,
    trackButtonClick,
    trackScrollDepth,
  };
}

// Hook para performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor de carga de página
    const handleLoad = () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
        firstByte: navigationTiming.responseStart - navigationTiming.fetchStart,
        dnsLookup: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
        connectionTime: navigationTiming.connectEnd - navigationTiming.connectStart,
      };

      console.log('Performance Metrics:', metrics);
    };

    // Monitor de recursos
    const monitorResources = () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow Resources:', slowResources);
      }
    };

    // Monitor de memoria (Chrome)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
        
        // Alertar si el uso de memoria es muy alto
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
          console.warn('High Memory Usage:', memoryUsage);
        }
      }
    };

    window.addEventListener('load', handleLoad);
    
    // Ejecutar monitoreo cada 30 segundos
    const interval = setInterval(() => {
      monitorResources();
      monitorMemory();
    }, 30000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(interval);
    };
  }, []);
}

// Hook para scroll depth tracking
export function useScrollTracking() {
  const { trackScrollDepth } = useAnalytics();

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const reached: Set<number> = new Set();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / documentHeight) * 100;

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackScrollDepth(milestone);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);
}

// Hook para A/B testing básico
export function useABTesting(testName: string, variants: string[]) {
  const [variant, setVariant] = useState<string>('');

  useEffect(() => {
    // Obtener o asignar variante basada en localStorage
    const storageKey = `ab_test_${testName}`;
    let userVariant = localStorage.getItem(storageKey);

    if (!userVariant || !variants.includes(userVariant)) {
      // Asignar variante aleatoria
      userVariant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(storageKey, userVariant);
    }

    setVariant(userVariant);

    // Track assignment
    const { trackEvent } = useAnalytics();
    trackEvent({
      event: 'ab_test_assignment',
      category: 'experiments',
      label: `${testName}_${userVariant}`,
    });
  }, [testName, variants]);

  const trackConversion = useCallback((conversionEvent: string) => {
    const { trackEvent } = useAnalytics();
    trackEvent({
      event: 'ab_test_conversion',
      category: 'experiments',
      label: `${testName}_${variant}_${conversionEvent}`,
    });
  }, [testName, variant]);

  return { variant, trackConversion };
}

export default {
  useCoreWebVitals,
  useAnalytics,
  usePerformanceMonitoring,
  useScrollTracking,
  useABTesting,
};
