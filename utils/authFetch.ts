/**
 * Utilidades para manejo silencioso de autenticación
 * Evita mostrar errores 401 esperados en la consola
 */

interface FetchOptions extends RequestInit {
  silentAuth?: boolean;
}

/**
 * Fetch personalizado que maneja silenciosamente los errores 401 de autenticación
 */
export async function authFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { silentAuth = false, ...fetchOptions } = options;

  // Configurar opciones por defecto
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
  };

  // Combinar opciones
  const finalOptions = { ...defaultOptions, ...fetchOptions };

  // Hacer fetch silencioso para auth/me si se especifica
  if (silentAuth || url.includes('/api/auth/me')) {
    try {
      const response = await fetch(url, finalOptions);
      
      // No mostrar errores 401 en consola para auth endpoints
      if (response.status === 401 && (silentAuth || url.includes('/api/auth/me'))) {
        return response;
      }
      
      return response;
    } catch (error) {
      // Capturar errores silenciosamente para auth
      return new Response(null, { status: 500 });
    }
  }

  // Para otros endpoints, comportamiento normal
  return fetch(url, finalOptions);
}

// Función global para interceptar errores de consola relacionados con auth
export function suppressAuthErrors() {
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = function(...args: any[]) {
      const message = args.join(' ');
      
      // Suprimir errores 401 específicos de /api/auth/me
      if (message.includes('401') && message.includes('/api/auth/me')) {
        return;
      }
      
      // Suprimir otros errores de fetch de auth
      if (message.includes('Failed to fetch') && message.includes('auth')) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}

/**
 * Hook para verificar autenticación sin generar errores en consola
 */
export const checkAuthSilently = async (): Promise<{
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
}> => {
  try {
    const response = await authFetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      silentAuth: true
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data?.user) {
        return {
          isAuthenticated: true,
          user: result.data.user,
          error: null
        };
      }
    }

    // 401 es normal para usuarios no autenticados
    if (response.status === 401) {
      return {
        isAuthenticated: false,
        user: null,
        error: null
      };
    }

    // Otros códigos de error
    return {
      isAuthenticated: false,
      user: null,
      error: `Error del servidor (${response.status})`
    };

  } catch (error) {
    console.error('Error de conexión durante verificación de autenticación:', error);
    return {
      isAuthenticated: false,
      user: null,
      error: 'Error de conexión'
    };
  }
};

export default authFetch;