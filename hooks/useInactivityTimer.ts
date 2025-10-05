import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInactivityTimerOptions {
  timeout: number; // en milisegundos
  onTimeout: () => void;
  warningTime?: number; // tiempo antes del timeout para mostrar advertencia (en ms)
}

interface UseInactivityTimerReturn {
  timeRemaining: number;
  showWarning: boolean;
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

/**
 * Hook para detectar inactividad del usuario y mostrar advertencias
 * Similar al comportamiento de Microsoft/Google login
 * 
 * @param options - Configuración del timer
 * @returns Estado del timer y funciones de control
 */
export function useInactivityTimer({
  timeout,
  onTimeout,
  warningTime = 15000 // 15 segundos antes por defecto
}: UseInactivityTimerOptions): UseInactivityTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [showWarning, setShowWarning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(timeout);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeRemaining(timeout);
    setShowWarning(false);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    remainingTimeRef.current = timeout;
  }, [timeout, clearTimer]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    clearTimer();
    // Guardar el tiempo restante actual
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setTimeRemaining(remainingTimeRef.current);
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    // Iniciar el interval
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      
      setTimeRemaining(remaining);

      // Mostrar advertencia cuando queda poco tiempo
      if (remaining <= warningTime && remaining > 0) {
        setShowWarning(true);
      }

      // Timeout alcanzado
      if (remaining === 0) {
        clearTimer();
        onTimeout();
      }
    }, 100); // Actualizar cada 100ms para mayor precisión

    return () => {
      clearTimer();
    };
  }, [isPaused, warningTime, onTimeout, clearTimer]);

  return {
    timeRemaining,
    showWarning,
    resetTimer,
    pauseTimer,
    resumeTimer
  };
}
