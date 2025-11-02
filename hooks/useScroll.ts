import { useCallback, useEffect, useState } from 'react';

interface ScrollToSectionOptions {
  behavior?: ScrollBehavior;
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
      offset = 80
    } = options;

    setIsScrolling(true);

    const element = document.querySelector(selector);
    
    if (element) {
      // Calcula posición considerando el offset del header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior
      });

  // Marca como completado tras la animación
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

  // Opcional: Focus management para accesibilidad (mantener si hay contexto útil)
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

// Hook para detectar la sección actual visible (mantener si hay contexto útil)
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
  threshold: 0.5,
  rootMargin: '-80px 0px -80px 0px'
      }
    );

  // Observa todas las secciones
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
