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
    setIsScrolling(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      disabled={isScrolling}
      className={`fixed bottom-8 right-8 z-40 p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 ${
        isScrolling ? 'scale-110' : 'scale-100'
      } disabled:opacity-50`}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
    >
      <FaChevronUp className={`w-5 h-5 transition-transform duration-300 ${isScrolling ? 'animate-bounce' : ''}`} />
    </button>
  );
};

export default ScrollToTop;
