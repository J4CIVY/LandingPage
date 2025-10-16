import { useState, useCallback } from 'react';
import { sanitizeEmail } from '@/lib/input-sanitization';

export interface UseEmailValidationReturn {
  email: string;
  isValid: boolean;
  error: string;
  handleChange: (value: string) => void;
  setEmail: (value: string) => void;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Custom hook for email validation with sanitization
 * 
 * @param initialValue - Initial email value
 * @param required - Whether the email is required
 * @returns Email validation state and handlers
 * 
 * @example
 * ```tsx
 * const { email, isValid, error, handleChange } = useEmailValidation('', true);
 * 
 * <input
 *   type="email"
 *   value={email}
 *   onChange={(e) => handleChange(e.target.value)}
 * />
 * {error && <span className="error">{error}</span>}
 * ```
 */
export function useEmailValidation(
  initialValue: string = '',
  required: boolean = false
): UseEmailValidationReturn {
  const [email, setEmailState] = useState<string>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validate = useCallback((value: string): boolean => {
    // If empty and not required, it's valid
    if (!value.trim()) {
      if (required) {
        setError('El correo electrónico es obligatorio');
        setIsValid(false);
        return false;
      }
      setError('');
      setIsValid(true);
      return true;
    }

    // Sanitize and validate
    const sanitized = sanitizeEmail(value);
    
    if (!sanitized) {
      setError('Formato de correo electrónico inválido');
      setIsValid(false);
      return false;
    }

    setError('');
    setIsValid(true);
    return true;
  }, [required]);

  const handleChange = useCallback((value: string) => {
    setEmailState(value);
    validate(value);
  }, [validate]);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    validate(value);
  }, [validate]);

  const reset = useCallback(() => {
    setEmailState('');
    setError('');
    setIsValid(false);
  }, []);

  return {
    email,
    isValid,
    error,
    handleChange,
    setEmail,
    validate: () => validate(email),
    reset,
  };
}
