'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { FaCheckCircle, FaScroll, FaArrowDown } from 'react-icons/fa';

interface DocumentReaderProps {
  title: string;
  content: ReactNode;
  onAccept: () => void;
  onCancel: () => void;
  acceptButtonText?: string;
}

export default function DocumentReader({
  title,
  content,
  onAccept,
  onCancel,
  acceptButtonText = 'Acepto'
}: DocumentReaderProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px de margen

    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    }
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto" aria-labelledby="document-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>

      {/* Modal centrado */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
          {/* Header */}
          <div className="bg-linear-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <div className="flex items-center">
              <FaScroll className="text-white text-2xl mr-3" />
              <h3 className="text-xl font-semibold text-white">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className="relative max-h-[60vh] overflow-y-auto px-6 py-4 bg-white dark:bg-slate-800 scroll-smooth"
          >
            <div className="prose dark:prose-invert max-w-none">
              {content}
            </div>

            {/* Scroll indicator */}
            {showScrollHint && !hasScrolledToBottom && (
              <div className="sticky bottom-0 left-0 right-0 bg-linear-to-t from-white dark:from-slate-800 via-white/90 dark:via-slate-800/90 to-transparent pt-8 pb-4 text-center">
                <div className="flex flex-col items-center space-y-2 animate-bounce">
                  <FaArrowDown className="text-cyan-600 text-xl" />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Desplázate hasta el final para continuar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              {hasScrolledToBottom ? (
                <>
                  <FaCheckCircle className="text-green-600 text-lg" />
                  <span className="text-sm font-medium text-green-600">
                    Documento leído completamente
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Lee el documento completo para continuar
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAccept}
                disabled={!hasScrolledToBottom}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  hasScrolledToBottom
                    ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-md'
                    : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {acceptButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
