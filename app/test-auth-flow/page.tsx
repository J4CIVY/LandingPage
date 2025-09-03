'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function TestAuthFlowPage() {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const runAuthTests = async () => {
    const results = [];
    
    // Test 1: Check current auth state
    results.push({
      test: 'Estado de autenticación actual',
      result: { isAuthenticated, user: !!user, isLoading, isInitialized }
    });

    // Test 2: Check cookies
    results.push({
      test: 'Cookies del navegador',
      result: {
        cookies: document.cookie,
        hasAccessToken: document.cookie.includes('bsk-access-token')
      }
    });

    // Test 3: Test API /auth/me
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      results.push({
        test: 'API /auth/me',
        result: { status: response.status, data }
      });
    } catch (error) {
      results.push({
        test: 'API /auth/me',
        result: { error: String(error) }
      });
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test del Flujo de Autenticación</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado del AuthProvider</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Inicializado:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isInitialized ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <strong>Cargando:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {isLoading ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <strong>Autenticado:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <strong>Usuario:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user ? user.firstName + ' ' + user.lastName : 'No disponible'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={runAuthTests}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Ejecutar Pruebas de Autenticación
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resultados de las Pruebas</h2>
            {testResults.map((result, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                <h3 className="font-medium text-lg mb-2">{result.test}</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Instrucciones de Prueba</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
            <li>Abre esta página en una nueva pestaña</li>
            <li>Ve a /login e inicia sesión</li>
            <li>Regresa a esta página y ejecuta las pruebas</li>
            <li>Verifica que todos los valores sean correctos</li>
            <li>Intenta acceder a /dashboard desde el menú del usuario</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
