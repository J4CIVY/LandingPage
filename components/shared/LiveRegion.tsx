'use client';

import { useState, useEffect, type FC } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

/**
 * LiveRegion component for announcing dynamic content changes to screen readers
 * Implements aria-live regions for better accessibility
 */
const LiveRegion: FC<LiveRegionProps> = ({ 
  message, 
  politeness = 'polite', 
  atomic = true,
  className = 'sr-only'
}) => {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  useEffect(() => {
    if (message && message !== currentMessage) {
      setCurrentMessage(message);
      
      // Clear message after announcement to allow repeated announcements
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message, currentMessage]);

  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={className || 'sr-only'}
      role="status"
      // Si no es sr-only, aplicar estilos de contraste para accesibilidad
      style={className === 'sr-only' ? undefined : { backgroundColor: 'var(--tw-bg-opacity, #fff)', color: 'var(--tw-text-opacity, #020617)', padding: '0.5rem', borderRadius: '0.375rem' }}
    >
      {currentMessage}
    </div>
  );
};

export default LiveRegion;

// Hook para usar LiveRegion más fácilmente
export const useLiveRegion = () => {
  const [message, setMessage] = useState<string>('');

  const announce = (text: string) => {
    setMessage(text);
  };

  const LiveRegionComponent = () => (
    <LiveRegion message={message} />
  );

  return { announce, LiveRegionComponent };
};
