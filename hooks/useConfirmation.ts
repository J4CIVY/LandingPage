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
      e.preventDefault();
      e.returnValue = message;
      return message;
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

    const handleRouteChange = () => {
      if (shouldConfirm) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          throw new Error('Route change cancelled');
        }
      }
    };

    // Note: En Next.js 13+ con App Router, necesitamos manejar esto de manera diferente
    // Esta es una implementación simplificada
    return () => {
      // Cleanup si es necesario
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
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
  }: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // Para una implementación completa, aquí crearías un modal personalizado
      // Por ahora usamos el confirm nativo del navegador
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  };

  return { confirm };
};
