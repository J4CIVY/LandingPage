/**
 * Componente de imagen optimizada para performance móvil
 * Maneja lazy loading, responsive images y optimización de formatos
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
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
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  objectFit = 'cover',
  lazy = true,
  responsive = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [setRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Solo cargar la imagen cuando esté visible si lazy loading está habilitado
  const shouldLoad = !lazy || priority || isIntersecting;

  // Generar placeholder blur dinámico
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const commonProps = {
    alt,
    className: `${className} transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    onLoad: () => setIsLoaded(true),
    onError: () => setHasError(true),
    quality,
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL: blurDataURL || (placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined),
    style: { objectFit },
    priority,
  };

  if (hasError) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}
        style={{ width, height }}
        ref={setRef}
      >
        <span className="text-gray-500 text-sm">Error al cargar imagen</span>
      </div>
    );
  }

  if (!shouldLoad) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
        style={{ width, height }}
        ref={setRef}
      />
    );
  }

  if (responsive) {
    return (
      <div ref={setRef} className="relative">
        <Image
          src={src}
          fill
          sizes={sizes}
          {...commonProps}
        />
      </div>
    );
  }

  return (
    <div ref={setRef}>
      <Image
        src={src}
        width={width}
        height={height}
        sizes={sizes}
        {...commonProps}
      />
    </div>
  );
};

// Componente específico para avatares con optimizaciones adicionales
export const OptimizedAvatar: React.FC<{
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
export const OptimizedHeroImage: React.FC<{
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
