/**
 * Componente lazy optimizado para Google Maps
 * Carga diferida para reducir el bundle inicial
 */

'use client';

import { lazy, Suspense } from 'react';
import { SkeletonCard } from '../shared/SkeletonLoaders';

// Skeleton específico para mapas
const SkeletonMap = () => (
  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-500 dark:text-gray-400">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
);

// Lazy load del componente GoogleMap
const GoogleMapComponent = lazy(() => 
  import('@react-google-maps/api').then(module => ({
    default: ({ children, ...props }: any) => (
      <module.GoogleMap {...props}>
        {children}
      </module.GoogleMap>
    )
  }))
);

// Lazy load del LoadScript
const LoadScriptComponent = lazy(() =>
  import('@react-google-maps/api').then(module => ({
    default: module.LoadScript
  }))
);

interface LazyGoogleMapsProps {
  apiKey: string;
  mapContainerStyle: React.CSSProperties;
  center: { lat: number; lng: number };
  zoom: number;
  children?: React.ReactNode;
  onLoad?: (map: google.maps.Map) => void;
  options?: google.maps.MapOptions;
}

export const LazyGoogleMaps: React.FC<LazyGoogleMapsProps> = ({
  apiKey,
  mapContainerStyle,
  center,
  zoom,
  children,
  onLoad,
  options,
}) => {
  return (
    <Suspense fallback={<SkeletonMap />}>
      <LoadScriptComponent
        googleMapsApiKey={apiKey}
        loadingElement={<SkeletonMap />}
      >
        <GoogleMapComponent
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            ...options,
          }}
        >
          {children}
        </GoogleMapComponent>
      </LoadScriptComponent>
    </Suspense>
  );
};

export default LazyGoogleMaps;
