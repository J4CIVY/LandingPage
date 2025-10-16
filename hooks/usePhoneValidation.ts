import { useState, useCallback } from 'react';
import { sanitizePhone } from '@/lib/input-sanitization';

export interface UsePhoneValidationReturn {
  phone: string;
  isValid: boolean;
  error: string;
  handleChange: (value: string) => void;
  setPhone: (value: string) => void;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Custom hook for phone number validation with sanitization
 * 
 * @param initialValue - Initial phone value
 * @param required - Whether the phone is required
 * @returns Phone validation state and handlers
 * 
 * @example
 * ```tsx
 * const { phone, isValid, error, handleChange } = usePhoneValidation('', true);
 * 
 * <input
 *   type="tel"
 *   value={phone}
 *   onChange={(e) => handleChange(e.target.value)}
 * />
 * {error && <span className="error">{error}</span>}
 * ```
 */
export function usePhoneValidation(
  initialValue: string = '',
  required: boolean = false
): UsePhoneValidationReturn {
  const [phone, setPhoneState] = useState<string>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validate = useCallback((value: string): boolean => {
    // If empty and not required, it's valid
    if (!value.trim()) {
      if (required) {
        setError('El número de teléfono es obligatorio');
        setIsValid(false);
        return false;
      }
      setError('');
      setIsValid(true);
      return true;
    }

    // Sanitize and validate
    const sanitized = sanitizePhone(value);
    
    if (!sanitized) {
      setError('Formato de teléfono inválido (10-15 dígitos)');
      setIsValid(false);
      return false;
    }

    // Additional validation for Colombian phone numbers
    // Colombian mobile: 10 digits starting with 3
    // Colombian landline: 10 digits starting with other digits
    const colombianMobileRegex = /^(\+?57)?3\d{9}$/;
    const colombianLandlineRegex = /^(\+?57)?[1-8]\d{9}$/;
    const internationalRegex = /^\+\d{10,14}$/;
    
    const isColombianMobile = colombianMobileRegex.test(sanitized);
    const isColombianLandline = colombianLandlineRegex.test(sanitized);
    const isInternational = internationalRegex.test(sanitized);
    
    if (!isColombianMobile && !isColombianLandline && !isInternational) {
      setError('Número de teléfono no válido para Colombia');
      setIsValid(false);
      return false;
    }

    setError('');
    setIsValid(true);
    return true;
  }, [required]);

  const handleChange = useCallback((value: string) => {
    setPhoneState(value);
    validate(value);
  }, [validate]);

  const setPhone = useCallback((value: string) => {
    setPhoneState(value);
    validate(value);
  }, [validate]);

  const reset = useCallback(() => {
    setPhoneState('');
    setError('');
    setIsValid(false);
  }, []);

  return {
    phone,
    isValid,
    error,
    handleChange,
    setPhone,
    validate: () => validate(phone),
    reset,
  };
}
