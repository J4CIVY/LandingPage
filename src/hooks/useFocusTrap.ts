import { useEffect, useRef } from 'react';

export const useFocusTrap = <T extends HTMLElement>(isOpen: boolean) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return;

      const focusableElements = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleFocus);
      ref.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleFocus);
    };
  }, [isOpen]);

  return ref;
};
