'use client';

import { useEffect, useState } from 'react';
import { getSafeEnvInfo } from '@/lib/env-validation';

/**
 * Environment Status Component
 * Displays environment configuration status in development mode
 * Shows warnings if critical environment variables are missing
 */
export default function EnvStatus() {
  const [envInfo, setEnvInfo] = useState<ReturnType<typeof getSafeEnvInfo> | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const info = getSafeEnvInfo();
        setEnvInfo(info);
      } catch (error) {
        console.error('Failed to get environment info:', error);
      }
    }
  }, []);

  // Don't render in production or if no info
  if (process.env.NODE_ENV === 'production' || !envInfo) {
    return null;
  }

  const warnings: string[] = [];
  if (!envInfo.hasCloudinary) warnings.push('Cloudinary not configured');
  if (!envInfo.hasRecaptcha) warnings.push('reCAPTCHA not configured');
  
  const hasWarnings = warnings.length > 0;

  return (
    <div className="fixed bottom-20 left-4 z-40">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
          hasWarnings 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 text-yellow-800 dark:text-yellow-200'
            : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400 text-green-800 dark:text-green-200'
        }`}
      >
        {hasWarnings ? '⚠️' : '✅'} ENV
      </button>

      {showDetails && (
        <div className="absolute bottom-12 left-0 w-80 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-xl p-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
            Environment Status
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mode:</span>
              <span className={`font-medium ${
                envInfo.isProduction ? 'text-red-600' : 'text-blue-600'
              }`}>
                {envInfo.nodeEnv}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">App URL:</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white truncate max-w-[180px]">
                {envInfo.appUrl}
              </span>
            </div>

            <hr className="border-gray-200 dark:border-slate-600" />

            <div className="space-y-1">
              <ServiceStatus name="Cloudinary" enabled={envInfo.hasCloudinary} />
              <ServiceStatus name="reCAPTCHA" enabled={envInfo.hasRecaptcha} />
              <ServiceStatus name="Analytics" enabled={envInfo.hasAnalytics} />
              <ServiceStatus name="Bold Payment" enabled={envInfo.hasBold} />
            </div>

            {warnings.length > 0 && (
              <>
                <hr className="border-gray-200 dark:border-slate-600" />
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceStatus({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">{name}:</span>
      <span className={`text-xs font-medium ${
        enabled 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {enabled ? '✓ Configured' : '✗ Missing'}
      </span>
    </div>
  );
}
