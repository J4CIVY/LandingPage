'use client';

import React, { useState, useEffect } from 'react';

interface CaptchaFallbackProps {
  onVerified: () => void;
  onCancel?: () => void;
}

interface Challenge {
  id: string;
  question: string;
  expiresAt: number;
}

/**
 * CAPTCHA Fallback Component
 * Displays a visual math challenge when reCAPTCHA v3 score is too low
 */
export default function CaptchaFallback({ onVerified, onCancel }: CaptchaFallbackProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Load challenge on mount
  useEffect(() => {
    void loadChallenge();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!challenge) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((challenge.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setError('El challenge ha expirado. Por favor, recarga la página.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge]);

  const loadChallenge = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/captcha/challenge', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setChallenge(result.challenge);
      } else {
        setError('Error al cargar el challenge. Por favor, intenta de nuevo.');
      }
    } catch {
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challenge || !answer.trim()) {
      setError('Por favor, ingresa tu respuesta.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/captcha/challenge', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          answer: answer.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        onVerified();
      } else {
        setError(result.message || 'Respuesta incorrecta. Intenta de nuevo.');
        setAnswer('');
      }
    } catch {
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading && !challenge) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando verificación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Verificación de Seguridad
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Info Message */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Por seguridad, necesitamos verificar que eres humano. Por favor, responde la siguiente pregunta:
          </p>
        </div>

        {/* Challenge Question */}
        {challenge && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-3">
                {challenge.question}
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tu respuesta"
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading || !answer.trim()}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Esta verificación adicional nos ayuda a proteger tu cuenta de accesos no autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
