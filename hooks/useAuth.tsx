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
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified: boolean;
  profileImage?: string;
  membershipStatus?: string;
  membershipType?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  // Fase 3: Multi-factor authentication
  requires2FA?: boolean;
  requiresDeviceTrust?: boolean;
  blocked?: boolean;
  alerts?: string[];
  riskScore?: number;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  [key: string]: unknown;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean, twoFactorCode?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  isInitialized: boolean;
}

// Fase 3: Login result with 2FA support
interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  requiresDeviceTrust?: boolean;
  blocked?: boolean;
  alerts?: string[];
  riskScore?: number;
  message?: string;
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
   * Check if user is authenticated via cookies httpOnly
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      updateAuthState({ isLoading: true, error: null });

      // Verify with backend - cookies sent automatically
      const response = await apiClient.get<AuthResponse>('/auth/me');

      if (response.success && response.user) {
        updateAuthState({
          isAuthenticated: true,
          user: response.user,
          isLoading: false,
          error: null
        });
        return true;
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      return false;

    } catch (error) {
      const err = error as { status?: number; message?: string };
      
      // Solo logear errores que no sean 401 (no autorizado es esperado)
      if (err.status !== 401) {
        console.error('Error checking auth:', err);
      }

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
   * Login user - Fase 3: Multi-step with 2FA and device trust
   */
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe?: boolean,
    twoFactorCode?: string
  ): Promise<LoginResult> => {
    try {
      updateAuthState({ isLoading: true, error: null });

      // Backend sets cookies automatically and handles security checks
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
        rememberMe: rememberMe || false,
        twoFactorCode, // Include 2FA code if provided
      }, { requireAuth: false });

      // CASO 1: Cuenta bloqueada temporalmente
      if (response.blocked) {
        const errorMessage = response.alerts?.join('. ') || 'Cuenta bloqueada temporalmente por actividad sospechosa';
        updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: errorMessage
        });
        return {
          success: false,
          blocked: true,
          alerts: response.alerts,
          riskScore: response.riskScore,
          message: errorMessage
        };
      }

      // CASO 2: Requiere código 2FA
      if (response.requires2FA) {
        updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        });
        return {
          success: false,
          requires2FA: true,
          riskScore: response.riskScore,
          message: 'Se requiere código de autenticación de dos factores'
        };
      }

      // CASO 3: Necesita confiar en dispositivo (opcional después de 2FA)
      if (response.requiresDeviceTrust) {
        updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        });
        return {
          success: false,
          requiresDeviceTrust: true,
          message: '¿Confiar en este dispositivo por 30 días?'
        };
      }

      // CASO 4: Login exitoso
      if (response.success && response.user) {
        updateAuthState({
          isAuthenticated: true,
          user: response.user,
          isLoading: false,
          error: null
        });
        return {
          success: true,
          message: response.message || 'Inicio de sesión exitoso'
        };
      }

      // CASO 5: Error general
      const errorMessage = response.message || 'Error al iniciar sesión';
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: errorMessage
      });
      return {
        success: false,
        message: errorMessage
      };

    } catch (error) {
      const err = error as { message?: string; data?: { message?: string } };
      console.error('Login error:', err);
      
      const errorMessage = err.data?.message || err.message || 'Error al iniciar sesión';
      
      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: errorMessage
      });
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [updateAuthState]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true });

      // Backend clears cookies automatically
      try {
        await apiClient.post<AuthResponse>('/auth/logout', {});
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with logout even if API call fails
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

      // Redirect to home instead of login
      router.push('/');
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
      router.push('/');
    }
  }, [updateAuthState, router]);

  /**
   * Refresh authentication token
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Call refresh endpoint - backend will rotate tokens
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {}, {
        requireAuth: false,
      });

      if (response.success && response.user) {
        updateAuthState({
          isAuthenticated: true,
          user: response.user,
          isLoading: false,
          error: null
        });
        return true;
      }

      // If refresh fails, check auth one more time
      return await checkAuth();

    } catch (error) {
      console.error('Error refreshing auth:', error);
      
      // Don't force logout on refresh error - let the user continue
      // The next API call will trigger a proper auth check
      return false;
    }
  }, [checkAuth, updateAuthState]);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data, {
        requireAuth: false,
      });

      return {
        success: response.success,
        message: response.message || 'Usuario registrado exitosamente',
      };
    } catch (error) {
      const err = error as { message?: string; data?: { message?: string } };
      return {
        success: false,
        message: err.data?.message || err.message || 'Error al registrar usuario',
      };
    }
  }, []);

  /**
   * Verify email with token
   */
  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/verify-email', { token }, {
        requireAuth: false,
      });

      return {
        success: response.success,
        message: response.message || 'Email verificado exitosamente',
      };
    } catch (error) {
      const err = error as { message?: string; data?: { message?: string } };
      return {
        success: false,
        message: err.data?.message || err.message || 'Error al verificar email',
      };
    }
  }, []);

  /**
   * Request password reset
   */
  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/forgot-password', { email }, {
        requireAuth: false,
      });

      return {
        success: true,
        message: response.message || 'Si el email existe, recibirás instrucciones para resetear tu contraseña',
      };
    } catch (error) {
      return {
        success: true, // Always return success to avoid email enumeration
        message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña',
      };
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/reset-password', {
        token,
        newPassword,
      }, {
        requireAuth: false,
      });

      return {
        success: response.success,
        message: response.message || 'Contraseña reseteada exitosamente',
      };
    } catch (error) {
      const err = error as { message?: string; data?: { message?: string } };
      return {
        success: false,
        message: err.data?.message || err.message || 'Error al resetear contraseña',
      };
    }
  }, []);

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
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
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
