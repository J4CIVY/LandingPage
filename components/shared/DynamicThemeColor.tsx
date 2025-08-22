'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function DynamicThemeColor() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Determinar el tema actual
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Definir los colores según el tema
    const themeColor = currentTheme === 'dark' ? '#020617' : '#ffffff';
    
    // Actualizar o crear el meta tag theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColor);
    } else {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', themeColor);
      document.head.appendChild(themeColorMeta);
    }

    // Actualizar meta tag para iOS Safari
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    
    if (appleMeta) {
      appleMeta.setAttribute('content', currentTheme === 'dark' ? 'black-translucent' : 'default');
    } else {
      appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      appleMeta.setAttribute('content', currentTheme === 'dark' ? 'black-translucent' : 'default');
      document.head.appendChild(appleMeta);
    }

    // Meta tag adicional para Android Chrome
    let msapplicationMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
    
    if (msapplicationMeta) {
      msapplicationMeta.setAttribute('content', themeColor);
    } else {
      msapplicationMeta = document.createElement('meta');
      msapplicationMeta.setAttribute('name', 'msapplication-navbutton-color');
      msapplicationMeta.setAttribute('content', themeColor);
      document.head.appendChild(msapplicationMeta);
    }
    
  }, [theme, systemTheme]);

  return null; // Este componente no renderiza nada visible
}
