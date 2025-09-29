"use client";

import { useEffect, useRef, useState } from 'react';

interface UseTextAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

export const useTextAnimation = (options: UseTextAnimationOptions = {}) => {
  const {
    threshold = 0.2,
    rootMargin = '0px 0px -5% 0px',
    triggerOnce = true,
    delay = 0,
    animationType = 'fadeIn'
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true);
            if (triggerOnce) {
              setHasAnimated(true);
            }
          }, delay);
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated]);

  const getAnimationClasses = () => {
  // Transición suave con easing personalizado y respeto a prefers-reduced-motion
    const baseClasses = 'transition-all duration-1000 ease-natural gpu-accelerated';
    
    if (!isVisible) {
      switch (animationType) {
        case 'fadeIn':
          return `${baseClasses} opacity-0 transform`;
        case 'slideUp':
          return `${baseClasses} opacity-0 translate-y-4 transform`;
        case 'slideInLeft':
          return `${baseClasses} opacity-0 -translate-x-4 transform`;
        case 'slideInRight':
          return `${baseClasses} opacity-0 translate-x-4 transform`;
        case 'scaleIn':
          return `${baseClasses} opacity-0 scale-95 transform`;
        default:
          return `${baseClasses} opacity-0 transform`;
      }
    }

    switch (animationType) {
      case 'fadeIn':
        return `${baseClasses} opacity-100 transform`;
      case 'slideUp':
        return `${baseClasses} opacity-100 translate-y-0 transform`;
      case 'slideInLeft':
        return `${baseClasses} opacity-100 translate-x-0 transform`;
      case 'slideInRight':
        return `${baseClasses} opacity-100 translate-x-0 transform`;
      case 'scaleIn':
        return `${baseClasses} opacity-100 scale-100 transform`;
      default:
        return `${baseClasses} opacity-100 transform`;
    }
  };

  return {
    ref: elementRef,
    isVisible,
    className: getAnimationClasses()
  };
};

// Hook para animar múltiples elementos de texto con delay escalonado (mantener si hay contexto útil)
export const useStaggeredTextAnimation = (
  count: number,
  options: UseTextAnimationOptions = {}
) => {
  const baseDelay = options.delay || 0;
  const staggerDelay = 100;
  
  return Array.from({ length: count }, (_, index) => 
    useTextAnimation({
      ...options,
      delay: baseDelay + (index * staggerDelay)
    })
  );
};
