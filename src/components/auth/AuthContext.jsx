import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mueve la lógica de navegación fuera del contexto
  const fetchCurrentUser = async (token) => {
    try {
      const { data } = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data.user;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await fetchCurrentUser(token);
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      const token = data.accessToken || data.token;
      localStorage.setItem('token', token);
      const userData = await fetchCurrentUser(token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // La redirección se manejará en los componentes
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};