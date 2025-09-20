'use client';

import { useState } from 'react';
import { authFetch } from '@/utils/authFetch';

export default function DebugAuthPage() {
  const [authResult, setAuthResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // Usar authFetch con silentAuth para evitar errores en consola
      const response = await authFetch('/api/auth/me', {
        method: 'GET',
        silentAuth: true
      });
      const result = await response.json();
      setAuthResult({ status: response.status, data: result });
    } catch (error) {
      setAuthResult({ error: String(error) });
    }
    setLoading(false);
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    setAuthResult({ cookies });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Auth</h1>
        
        <div className="space-y-4">
          <button
            onClick={checkAuth}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Auth API'}
          </button>
          
          <button
            onClick={checkCookies}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
          >
            Check Cookies
          </button>
        </div>

        {authResult && (
          <div className="mt-8 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
