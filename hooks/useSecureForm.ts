import { useState, useCallback, useRef } from 'react';
import { sanitizeObject, generateFormToken, validateFormToken, RateLimiter } from '@/utils/security';

interface SecureFormOptions {
  maxAttempts?: number;
  windowMs?: number;
  requireCsrf?: boolean;
}

interface SecureFormState {
  isSubmitting: boolean;
  error: string | null;
  isRateLimited: boolean;
  remainingTime: number;
}

export function useSecureForm<T>(
  submitFn: (data: T) => Promise<void>,
  options: SecureFormOptions = {}
) {
  const {
    maxAttempts = 5,
  windowMs = 300000,
    requireCsrf = true,
  } = options;

  const [state, setState] = useState<SecureFormState>({
    isSubmitting: false,
    error: null,
    isRateLimited: false,
    remainingTime: 0,
  });

  const rateLimiter = useRef(new RateLimiter(maxAttempts, windowMs));
  const formToken = useRef<string>(generateFormToken());

  const submit = useCallback(async (data: T) => {
  // Verifica rate limiting
  const clientId = 'form-submission';
    
    if (!rateLimiter.current.isAllowed(clientId)) {
      const remainingTime = rateLimiter.current.getRemainingTime(clientId);
      setState(prev => ({
        ...prev,
        isRateLimited: true,
        remainingTime: Math.ceil(remainingTime / 1000),
        error: `Demasiados intentos. Intenta nuevamente en ${Math.ceil(remainingTime / 60000)} minutos.`,
      }));
      return;
    }

  // Valida CSRF token
    if (requireCsrf && !validateFormToken(formToken.current)) {
      setState(prev => ({
        ...prev,
        error: 'Token de seguridad inválido. Recarga la página e intenta nuevamente.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
      isRateLimited: false,
      remainingTime: 0,
    }));

    try {
  // Sanitiza datos de entrada
      const sanitizedData = sanitizeObject(data);
      
  // Envía formulario
      await submitFn(sanitizedData);
      
  // Genera nuevo token para siguiente envío
      formToken.current = generateFormToken();
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al procesar la solicitud';
        
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));
    }
  }, [submitFn, requireCsrf]);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const resetRateLimit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRateLimited: false,
      remainingTime: 0,
    }));
  }, []);

  return {
    submit,
    resetError,
    resetRateLimit,
    formToken: formToken.current,
    ...state,
  };
}
