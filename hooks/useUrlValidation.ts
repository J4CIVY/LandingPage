import { useState, useCallback } from 'react';
import { sanitizeUrl } from '@/lib/input-sanitization';

export interface UseUrlValidationReturn {
  url: string;
  isValid: boolean;
  error: string;
  handleChange: (value: string) => void;
  setUrl: (value: string) => void;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Custom hook for URL validation with sanitization
 * 
 * @param initialValue - Initial URL value
 * @param required - Whether the URL is required
 * @param allowedProtocols - Array of allowed protocols (default: ['https:', 'http:', 'mailto:', 'tel:'])
 * @returns URL validation state and handlers
 * 
 * @example
 * ```tsx
 * const { url, isValid, error, handleChange } = useUrlValidation('', false);
 * 
 * <input
 *   type="url"
 *   value={url}
 *   onChange={(e) => handleChange(e.target.value)}
 * />
 * {error && <span className="error">{error}</span>}
 * ```
 */
export function useUrlValidation(
  initialValue: string = '',
  required: boolean = false,
  allowedProtocols: string[] = ['https:', 'http:', 'mailto:', 'tel:']
): UseUrlValidationReturn {
  const [url, setUrlState] = useState<string>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validate = useCallback((value: string): boolean => {
    // If empty and not required, it's valid
    if (!value.trim()) {
      if (required) {
        setError('La URL es obligatoria');
        setIsValid(false);
        return false;
      }
      setError('');
      setIsValid(true);
      return true;
    }

    // Sanitize URL (blocks javascript:, data:, vbscript:)
    const sanitized = sanitizeUrl(value);
    
    if (!sanitized) {
      setError('URL no válida o protocolo peligroso detectado');
      setIsValid(false);
      return false;
    }

    // Additional protocol validation
    try {
      // Check if it's a relative URL
      if (!value.includes(':') || value.startsWith('/')) {
        // Relative URLs are valid
        setError('');
        setIsValid(true);
        return true;
      }

      const parsed = new URL(value);
      
      if (!allowedProtocols.includes(parsed.protocol)) {
        setError(`Protocolo no permitido. Solo se permiten: ${allowedProtocols.join(', ')}`);
        setIsValid(false);
        return false;
      }
    } catch {
      // If URL parsing fails but sanitizeUrl passed, it might be a relative URL
      if (sanitized) {
        setError('');
        setIsValid(true);
        return true;
      }
      
      setError('Formato de URL inválido');
      setIsValid(false);
      return false;
    }

    setError('');
    setIsValid(true);
    return true;
  }, [required, allowedProtocols]);

  const handleChange = useCallback((value: string) => {
    setUrlState(value);
    validate(value);
  }, [validate]);

  const setUrl = useCallback((value: string) => {
    setUrlState(value);
    validate(value);
  }, [validate]);

  const reset = useCallback(() => {
    setUrlState('');
    setError('');
    setIsValid(false);
  }, []);

  return {
    url,
    isValid,
    error,
    handleChange,
    setUrl,
    validate: () => validate(url),
    reset,
  };
}
