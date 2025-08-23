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
      className={`fixed bottom-8 right-8 z-50 p-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/50 ${
        isScrolling ? 'scale-95 opacity-75' : 'scale-100 opacity-100 hover:scale-105'
      } disabled:pointer-events-none`}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
    >
      <FaChevronUp 
        className={`w-5 h-5 transition-transform duration-200 ${
          isScrolling ? 'animate-pulse scale-110' : ''
        }`} 
      />
    </button>
  );
};

export default ScrollToTop;
