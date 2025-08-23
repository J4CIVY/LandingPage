/**
 * Optimizaciones específicas para dispositivos móviles
 * Incluye gestos touch, viewport adaptativo y optimizaciones de performance
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

// Hook para gestos táctiles optimizados
export function useTouchGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Swipe horizontal
      if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
      if (isRightSwipe && onSwipeRight) onSwipeRight();
    } else {
      // Swipe vertical
      if (isUpSwipe && onSwipeUp) onSwipeUp();
      if (isDownSwipe && onSwipeDown) onSwipeDown();
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// Hook para viewport dinámico en mobile
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const updateViewportHeight = () => {
      // Usar altura real del viewport en mobile
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return viewportHeight;
}

// Hook para conexión de red y calidad
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    connectionType: 'unknown',
    isSlowConnection: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.effectiveType || 'unknown',
        isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
      });
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}

// Hook para optimizar animaciones según la preferencia del usuario
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook para detectar dispositivo y orientación
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    hasTouch: false,
    pixelRatio: 1,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
        hasTouch: 'ontouchstart' in window,
        pixelRatio: window.devicePixelRatio || 1,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Componente para manejo de estado offline
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm">
      <span>📡 Sin conexión a internet</span>
    </div>
  );
};

// Componente para indicador de conexión lenta
export const SlowConnectionIndicator: React.FC = () => {
  const { isSlowConnection } = useNetworkStatus();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isSlowConnection) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSlowConnection]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-500 text-white text-center py-2 text-sm">
      <span>🐌 Conexión lenta detectada - Se está optimizando el contenido</span>
    </div>
  );
};

// Hook para optimizar recursos según conexión
export function useAdaptiveLoading() {
  const { isSlowConnection, connectionType } = useNetworkStatus();
  const { isMobile } = useDeviceInfo();

  return {
    shouldPreloadImages: !isSlowConnection && !isMobile,
    shouldUseWebP: connectionType !== 'slow-2g' && connectionType !== '2g',
    maxImageQuality: isSlowConnection ? 60 : isMobile ? 75 : 85,
    shouldLazyLoad: isSlowConnection || isMobile,
    chunkSize: isSlowConnection ? 5 : 10,
  };
}

export default {
  useTouchGestures,
  useViewportHeight,
  useNetworkStatus,
  useReducedMotion,
  useDeviceInfo,
  useAdaptiveLoading,
  OfflineIndicator,
  SlowConnectionIndicator,
};
