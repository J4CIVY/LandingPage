'use client';

import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (isScrolling) return; // Prevent multiple clicks
    
    setIsScrolling(true);
    
    // Force auto scroll behavior
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Animated scroll to top
    const scrollToTopAnimated = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll > 0) {
        // Smooth easing function
        const ease = currentScroll * 0.15;
        window.scrollTo(0, currentScroll - Math.max(ease, 1));
        requestAnimationFrame(scrollToTopAnimated);
      } else {
        // Ensure we're at the top
        window.scrollTo(0, 0);
        setIsScrolling(false);
        // Restore scroll behavior
        document.documentElement.style.scrollBehavior = '';
      }
    };
    
    requestAnimationFrame(scrollToTopAnimated);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      disabled={isScrolling}
      className={`fixed bottom-8 right-8 z-50 p-4 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 active:bg-green-700 dark:active:bg-green-800 text-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:pointer-events-none ${
        isScrolling ? 'opacity-75' : 'opacity-100'
      }`}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
    >
      <FaChevronUp 
        className={`w-5 h-5 ${isScrolling ? 'animate-pulse' : ''}`} 
      />
    </button>
  );
};

export default ScrollToTop;
