
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthSilently, suppressAuthErrors } from '@/utils/authFetch';
import { IUser } from '@/lib/models/User';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean, redirectUrl?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isInitialized: boolean;
  setRedirectUrl: (url: string) => void;
  getRedirectUrl: () => string | null;
  clearRedirectUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Cache para evitar llamadas repetitivas
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const [authCheckPromise, setAuthCheckPromise] = useState<Promise<boolean> | null>(null);
  const AUTH_CACHE_DURATION = 30000; // 30 segundos
  
  const router = useRouter();

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const checkAuth = useCallback(async (forceRefresh: boolean = false) => {
    // Si ya hay una verificación en curso, retornar esa promesa
    if (authCheckPromise && !forceRefresh) {
      return authCheckPromise;
    }

    // Verificar si el cache es válido (excepto en refresh forzado)
    const now = Date.now();
    const cacheIsValid = (now - lastAuthCheck) < AUTH_CACHE_DURATION;
    
    if (cacheIsValid && !forceRefresh && authState.isAuthenticated) {
      // Cache válido y usuario autenticado, no hacer nueva llamada
      return authState.isAuthenticated;
    }

    // Crear nueva promesa de verificación
    const checkPromise = (async () => {
      try {
        updateAuthState({ isLoading: true, error: null });

        const result = await checkAuthSilently();
        
        updateAuthState({
          isAuthenticated: result.isAuthenticated,
          user: result.user,
          isLoading: false,
          error: result.error
        });
        
        // Actualizar timestamp del último check
        setLastAuthCheck(Date.now());
        
        return result.isAuthenticated;

      } catch (error) {
        // Solo errores inesperados llegarán aquí
        console.error('Error inesperado durante verificación de autenticación:', error);
        updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Error inesperado'
        });
        return false;
      } finally {
        // Limpiar la promesa cuando termine
        setAuthCheckPromise(null);
      }
    })();

    setAuthCheckPromise(checkPromise);
    return checkPromise;
  }, [updateAuthState, authCheckPromise, lastAuthCheck, authState.isAuthenticated]);

  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      updateAuthState({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        updateAuthState({
          isAuthenticated: true,
          user: result.data.user,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: result.message || 'Error al iniciar sesión'
        });
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Error de conexión'
      });
      return false;
    }
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true });

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

      router.push('/login');
      router.refresh();

    } catch (error) {
      console.error('Error en logout:', error);
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      router.push('/login');
    }
  }, [updateAuthState, router]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data?.user) {
          updateAuthState({
            isAuthenticated: true,
            user: result.data.user,
            error: null
          });
          return true;
        }
      }

      await logout();
      return false;

    } catch (error) {
      console.error('Error refreshing auth:', error);
      await logout();
      return false;
    }
  }, [updateAuthState, logout]);

  useEffect(() => {
    const initAuth = async () => {
      // Inicializar supresión de errores 401 para auth
      suppressAuthErrors();
      
      await checkAuth();
      setIsInitialized(true);
    };

    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isInitialized || !authState.isAuthenticated) return;

    const interval = setInterval(async () => {
      await refreshAuth();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, authState.isAuthenticated, refreshAuth]);

  // Funciones para manejar URL de redirección
  const setRedirectUrl = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectUrl', url);
    }
  }, []);

  const getRedirectUrl = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('redirectUrl');
    }
    return null;
  }, []);

  const clearRedirectUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('redirectUrl');
    }
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    isInitialized,
    setRedirectUrl,
    getRedirectUrl,
    clearRedirectUrl
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isInitialized && !auth.isAuthenticated && !auth.isLoading) {
      // Guardar la URL actual para redirección después del login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/login' && currentPath !== '/register') {
        auth.setRedirectUrl(currentPath);
      }
      router.push('/login');
    }
  }, [auth, router]);

  return auth;
}
