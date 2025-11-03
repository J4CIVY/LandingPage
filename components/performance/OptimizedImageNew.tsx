/**
 * Componente de imagen optimizada para performance móvil
 * Maneja lazy loading, responsive images y optimización de formatos
 * Versión mejorada con mejor gestión de errores y fallbacks
 */

'use client';

import Image from 'next/image';
import { useState, useCallback, type FC } from 'react';
import { useIntersectionObserver } from './LazyComponents';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  lazy?: boolean;
  responsive?: boolean;
  fallbackSrc?: string;
  onLoadingComplete?: () => void;
  onError?: () => void;
}

// Generar blur data URL base64 simple
const generateBlurDataURL = (width: number, height: number): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="0%"/>
          <stop stop-color="#e5e7eb" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`
  ).toString('base64')}`;
};

export const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  objectFit = 'cover',
  lazy = true,
  responsive = true,
  fallbackSrc,
  onLoadingComplete,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [setRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Solo cargar la imagen cuando esté visible si lazy loading está habilitado
  const shouldLoad = !lazy || priority || isIntersecting;

  // Generar blur placeholder automáticamente si no se proporciona
  const effectiveBlurDataURL = blurDataURL || generateBlurDataURL(width, height);

  const handleLoadingComplete = useCallback(() => {
    setIsLoaded(true);
    onLoadingComplete?.();
  }, [onLoadingComplete]);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [currentSrc, fallbackSrc, onError]);

  // Propiedades comunes para el componente Image
  const commonProps = {
    alt,
    className: `${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`,
    priority,
    quality,
    placeholder,
    blurDataURL: effectiveBlurDataURL,
    style: {
      objectFit,
    },
    onLoad: handleLoadingComplete,
    onError: handleError,
  };

  // Si hay error y no hay fallback, mostrar placeholder
  if (hasError) {
    return (
      <div 
        ref={setRef}
        className={`${className} bg-gray-200 dark:bg-gray-800 flex items-center justify-center`}
        style={{ width, height }}
        aria-label={`Error cargando imagen: ${alt}`}
      >
        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // Si no debe cargar aún (lazy loading), mostrar placeholder
  if (!shouldLoad) {
    return (
      <div 
        ref={setRef}
        className={`${className} bg-gray-200 dark:bg-gray-800 animate-pulse`}
        style={{ width, height }}
        aria-label={`Cargando imagen: ${alt}`}
      />
    );
  }

  // Renderizar imagen responsiva
  if (responsive) {
    return (
      <div ref={setRef} className="relative overflow-hidden bg-white dark:bg-gray-800">
        <Image
          src={currentSrc}
          fill
          sizes={sizes}
          {...commonProps}
        />
      </div>
    );
  }

  // Renderizar imagen con dimensiones fijas
  return (
    <div ref={setRef} className="bg-white dark:bg-gray-800">
      <Image
        src={currentSrc}
        width={width}
        height={height}
        sizes={sizes}
        {...commonProps}
      />
    </div>
  );
};

// Componente específico para avatares con optimizaciones adicionales
export const OptimizedAvatar: FC<{
  src: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src, alt, size = 40, className = '' }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      sizes={`${size}px`}
      quality={80}
      placeholder="blur"
      objectFit="cover"
      priority={size <= 64} // Priorizar avatares pequeños
    />
  );
};

// Componente para hero images con optimizaciones específicas
export const OptimizedHeroImage: FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      className={className}
      sizes="100vw"
      quality={85}
      priority={true}
      placeholder="blur"
      objectFit="cover"
      lazy={false}
    />
  );
};

// Hook para precargar imágenes críticas
export function useImagePreloader(imageSources: string[]) {
  useState(() => {
    imageSources.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  });
}

export default OptimizedImage;
