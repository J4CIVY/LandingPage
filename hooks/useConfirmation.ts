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
      // The custom message parameter is ignored by most modern browsers for security
      e.preventDefault();
      // Setting returnValue to empty string is the modern standard per MDN spec
      e.returnValue = '';
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

    const handleRouteChange = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
      if (shouldConfirm) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          throw new Error('Route change cancelled');
        }
      }
    };

  // En Next.js 13+ con App Router, se maneja diferente (mantener si hay contexto útil)
  // Implementación simplificada (mantener si hay contexto útil)
    return () => {
  // Limpieza si es necesario
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
    confirmText = 'Confirmar', // eslint-disable-line @typescript-eslint/no-unused-vars
    cancelText = 'Cancelar', // eslint-disable-line @typescript-eslint/no-unused-vars
    type = 'warning' // eslint-disable-line @typescript-eslint/no-unused-vars
  }: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
  // Para una implementación completa, aquí crearías un modal personalizado (mantener si hay contexto útil)
  // Por ahora se usa el confirm nativo del navegador
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  };

  return { confirm };
};
