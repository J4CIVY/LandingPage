/**
 * Componente para preload estratégico de recursos críticos
 * Optimiza la carga de recursos según la prioridad y el tipo de conexión
 */

'use client';

import { useEffect } from 'react';
import { useNetworkStatus } from './MobileOptimizations';

interface PreloadResource {
  href: string;
  as: 'image' | 'font' | 'style' | 'script' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  priority: 'high' | 'medium' | 'low';
}

interface StrategicPreloaderProps {
  resources: PreloadResource[];
  enableOnSlowConnection?: boolean;
}

export const StrategicPreloader: React.FC<StrategicPreloaderProps> = ({
  resources,
  enableOnSlowConnection = false,
}) => {
  const { isSlowConnection, connectionType } = useNetworkStatus();

  useEffect(() => {
    // No precargar en conexiones lentas a menos que se especifique
    if (isSlowConnection && !enableOnSlowConnection) {
      return;
    }

    // Filtrar recursos según la conexión
    const filteredResources = resources.filter(resource => {
      if (isSlowConnection) {
        return resource.priority === 'high';
      }
      if (connectionType === '3g') {
        return resource.priority !== 'low';
      }
      return true; // 4g o mejor, cargar todos
    });

    // Crear elementos de preload
    const preloadElements: HTMLLinkElement[] = [];

    filteredResources.forEach(resource => {
      const existingLink = document.querySelector(
        `link[rel="preload"][href="${resource.href}"]`
      );
      
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        
        if (resource.type) {
          link.type = resource.type;
        }
        
        if (resource.crossOrigin) {
          link.crossOrigin = resource.crossOrigin;
        }

        document.head.appendChild(link);
        preloadElements.push(link);
      }
    });

    // Cleanup al desmontar
    return () => {
      preloadElements.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources, isSlowConnection, connectionType, enableOnSlowConnection]);

  return null; // Este componente no renderiza nada visible
};

// Hook para preload dinámico basado en user interaction
export const useInteractionPreloader = () => {
  const preloadOnHover = (href: string, as: PreloadResource['as']) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  };

  const preloadOnFocus = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };

  return { preloadOnHover, preloadOnFocus };
};

// Recursos críticos predefinidos para BSK MT
export const BSK_CRITICAL_RESOURCES: PreloadResource[] = [
  {
    href: '/Logo_Letras_BSK_MT_500x500.webp',
    as: 'image',
    priority: 'high',
  },
  {
    href: 'https://res.cloudinary.com/dz0peilmu/image/upload/q_auto:best,c_fill,g_auto,f_webp,w_1366/Banner_Landing_Page_BSK_Motorcycle_Team_Julio_o2fcql',
    as: 'image',
    priority: 'high',
  },
];

export default StrategicPreloader;
