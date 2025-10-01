'use client';

import { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaSpinner, FaWhatsapp, FaRedo, FaClock } from 'react-icons/fa';

interface TwoFactorVerificationProps {
  twoFactorId: string;
  phoneNumber: string;
  expiresIn: number;
  onVerified: () => void;
  onCancel: () => void;
  onResend: () => Promise<void>;
}

export default function TwoFactorVerification({
  twoFactorId,
  phoneNumber,
  expiresIn,
  onVerified,
  onCancel,
  onResend
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(expiresIn);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCanResend(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-submit cuando se completan los 6 dígitos
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  }, [code]);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir caracteres alfanuméricos
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (sanitized.length === 0) {
      // Borrar
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      
      // Mover al input anterior
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (sanitized.length === 1) {
      // Un solo carácter
      const newCode = [...code];
      newCode[index] = sanitized;
      setCode(newCode);
      
      // Mover al siguiente input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (sanitized.length === 6) {
      // Pegar código completo
      const newCode = sanitized.split('').slice(0, 6);
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
    
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const sanitized = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (sanitized.length >= 6) {
      const newCode = sanitized.split('').slice(0, 6);
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          twoFactorId,
          code: codeToVerify
        })
      });

      const data = await response.json();

      if (data.success) {
        onVerified();
      } else {
        setError(data.message || 'Código incorrecto');
        
        // Limpiar el código para intentar de nuevo
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      await onResend();
      setTimeRemaining(expiresIn);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError('Error al reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <FaShieldAlt className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verificación en dos pasos
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-slate-400 mb-2">
            <FaWhatsapp className="text-green-500" />
            <p className="text-sm">
              Hemos enviado un código de 6 dígitos a
            </p>
          </div>
          
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {phoneNumber}
          </p>
        </div>

        {/* Code Input */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-800">
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isVerifying}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg
                  ${error 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-slate-600'
                  }
                  bg-white dark:bg-slate-800 
                  text-gray-900 dark:text-white
                  focus:border-blue-500 dark:focus:border-blue-400 
                  focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900
                  focus:outline-none
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-400 mb-6">
            <FaClock />
            <span>
              {timeRemaining > 0 
                ? `El código expira en ${formatTime(timeRemaining)}`
                : 'El código ha expirado'
              }
            </span>
          </div>

          {/* Loading State */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
              <FaSpinner className="animate-spin" />
              <span>Verificando...</span>
            </div>
          )}

          {/* Resend Button */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={!canResend || isResending}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                flex items-center justify-center gap-2
                ${canResend && !isResending
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {isResending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <FaRedo />
                  {canResend ? 'Reenviar código' : 'Espera para reenviar'}
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg font-medium
                bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700
                text-gray-700 dark:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            ¿No recibiste el código? Verifica tu WhatsApp o solicita uno nuevo.
          </p>
        </div>
      </div>
    </div>
  );
}
