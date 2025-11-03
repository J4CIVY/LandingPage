import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseBeforeUnloadOptions {
  enabled: boolean;
  message?: string;
}

export const useBeforeUnload = ({ enabled, message = '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.' }: UseBeforeUnloadOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers require preventDefault() and setting returnValue
      // returnValue is deprecated but still required for cross-browser compatibility
      e.preventDefault();
      e.returnValue = ''; // Legacy support for older browsers
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
};

export const useConfirmNavigation = (shouldConfirm: boolean, message = '¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.') => {
  const router = useRouter();

  useEffect(() => {
    if (!shouldConfirm) return;

    // Note: Next.js 13+ App Router doesn't provide direct route change interception
    // This hook is kept for compatibility and future implementation
    // For now, we rely on useBeforeUnload for page navigation warnings
    
    return () => {
      // Cleanup if needed
    };
  }, [shouldConfirm, message, router]);
};

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export const useConfirmation = () => {
  const confirm = ({
    title = 'Confirmar acción',
    message,
  }: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // For a complete implementation, a custom modal component would be created
      // Currently using native browser confirm dialog
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  };

  return { confirm };
};
