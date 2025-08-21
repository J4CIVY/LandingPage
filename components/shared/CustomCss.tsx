'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const CustomCss = () => {
  const pathname = usePathname();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = '/globals.css';
    link.rel = 'stylesheet';
    link.media = 'print';
    link.onload = () => {
      if (link.media) {
        link.media = 'all';
      }
    };
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [pathname]);

  return null;
};

export default CustomCss;
