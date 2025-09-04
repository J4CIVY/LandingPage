
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipType: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin' | 'super-admin';
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isInitialized: boolean;
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
  const router = useRouter();

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true, error: null });

      const response = await fetch('/api/auth/me', {
        method: 'GET',
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
            isLoading: false,
            error: null
          });
          return true;
        }
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      return false;

    } catch (error) {
      console.error('Error verificando autenticación:', error);
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Error de conexión'
      });
      return false;
    }
  }, [updateAuthState]);

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

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    isInitialized
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
      router.push('/login');
    }
  }, [auth.isInitialized, auth.isAuthenticated, auth.isLoading, router]);

  return auth;
}
