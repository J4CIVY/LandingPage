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
export const authFetch = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { silentAuth = false, ...fetchOptions } = options;
  
  // Para rutas de autenticación, interceptamos los errores de consola
  if (silentAuth || url.includes('/api/auth/me')) {
    try {
      const response = await fetch(url, fetchOptions);
      
      // Si es 401 en una ruta de auth, no es realmente un "error"
      if (response.status === 401 && (silentAuth || url.includes('/api/auth/me'))) {
        // Creamos una respuesta que no genere errores en consola
        return response;
      }
      
      return response;
    } catch (error) {
      // Solo re-lanzar errores reales de red
      throw error;
    }
  }
  
  // Para otras rutas, usar fetch normal
  return fetch(url, fetchOptions);
};

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