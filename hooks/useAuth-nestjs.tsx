/**
 * Updated Authentication Hook for NestJS Backend
 * Uses the new API client and matches NestJS endpoints
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  emailVerified: boolean;
  profileImage?: string;
  membershipStatus?: string;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  /**
   * Check if user is authenticated
   * Cookies httpOnly sent automatically
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      updateAuthState({ isLoading: true, error: null });

      // Verify token with backend - NestJS endpoint: GET /auth/me
      // Cookies sent automatically via credentials: 'include'
      const response = await apiClient.get<User>('/auth/me');

      updateAuthState({
        isAuthenticated: true,
        user: response,
        isLoading: false,
        error: null
      });
      return true;

    } catch (error) {
      console.error('Error checking auth:', error);

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      return false;
    }
  }, [updateAuthState]);

  /**
   * Login user
   */
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      updateAuthState({ isLoading: true, error: null });

      // NestJS endpoint: POST /auth/login
      // Backend sets httpOnly cookies automatically
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      }, { requireAuth: false });

      console.log('Login response:', response);

      // Wait a bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify authentication by checking /auth/me
      const verified = await checkAuth();
      console.log('Auth verified:', verified);

      if (!verified) {
        throw new Error('No se pudo verificar la sesión');
      }

      return true;

    } catch (error) {
      console.error('Login error:', error);
      const err = error as { message?: string };
      
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: err.message || 'Error al iniciar sesión'
      });
      return false;
    }
  }, [updateAuthState, checkAuth]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true });

      // NestJS endpoint: POST /auth/logout
      // Backend clears httpOnly cookies automatically
      try {
        await apiClient.post('/auth/logout', {});
      } catch (error) {
        // Continue logout even if API call fails
        console.error('Logout API call failed:', error);
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

      router.push('/login');
      router.refresh();

    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even on error
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      router.push('/login');
    }
  }, [updateAuthState, router]);

  /**
   * Refresh authentication token
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      // This is now handled automatically by apiClient
      // when it receives a 401 response
      return await checkAuth();

    } catch (error) {
      console.error('Error refreshing auth:', error);
      await logout();
      return false;
    }
  }, [checkAuth, logout]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (mounted) {
        // Skip auth check on public pages
        if (typeof window !== 'undefined') {
          const publicPages = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
          const isPublicPage = publicPages.some(page => window.location.pathname.startsWith(page));
          
          if (isPublicPage) {
            setIsInitialized(true);
            updateAuthState({ isLoading: false });
            return;
          }
        }
        
        await checkAuth();
        setIsInitialized(true);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuth, updateAuthState]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    checkAuth,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
