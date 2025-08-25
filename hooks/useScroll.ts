import { useCallback, useEffect, useState } from 'react';

interface ScrollToSectionOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  offset?: number;
}

export const useScrollToSection = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToSection = useCallback((
    selector: string, 
    options: ScrollToSectionOptions = {}
  ) => {
    const {
      behavior = 'smooth',
      block = 'start',
      inline = 'nearest',
      offset = 80 // Altura del header
    } = options;

    setIsScrolling(true);

    const element = document.querySelector(selector);
    
    if (element) {
      // Calcular posición considerando el offset del header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior
      });

      // Marcar como completado después de la animación
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

      // Opcional: Focus management para accesibilidad
      setTimeout(() => {
        if (element instanceof HTMLElement) {
          element.focus({ preventScroll: true });
        }
      }, 1000);

    } else {
      console.warn(`Element with selector "${selector}" not found`);
      setIsScrolling(false);
    }
  }, []);

  const scrollToTop = useCallback((options: ScrollToSectionOptions = {}) => {
    const { behavior = 'smooth' } = options;
    
    setIsScrolling(true);
    
    window.scrollTo({
      top: 0,
      behavior
    });

    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  const scrollToBottom = useCallback((options: ScrollToSectionOptions = {}) => {
    const { behavior = 'smooth' } = options;
    
    setIsScrolling(true);
    
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior
    });

    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  return {
    scrollToSection,
    scrollToTop,
    scrollToBottom,
    isScrolling
  };
};

// Hook para detectar la sección actual visible
export const useCurrentSection = (sections: string[]) => {
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.getAttribute('data-section');
            if (sectionId && sections.includes(sectionId)) {
              setCurrentSection(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.5, // La sección debe estar al menos 50% visible
        rootMargin: '-80px 0px -80px 0px' // Considerar header y footer
      }
    );

    // Observar todas las secciones
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId) || 
                     document.querySelector(`[data-section="${sectionId}"]`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  return currentSection;
};
