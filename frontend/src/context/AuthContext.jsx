import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillsprint_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check existing session on application start
  const verifySession = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('skillsprint_user', JSON.stringify(data.user));
      }
    } catch (err) {
      // Unauthenticated or expired session
      setUser(null);
      localStorage.removeItem('skillsprint_user');
      localStorage.removeItem('skillsprint_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('skillsprint_token', data.token);
      }
      localStorage.setItem('skillsprint_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.success) {
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('skillsprint_token', data.token);
      }
      localStorage.setItem('skillsprint_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request completed with warning:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('skillsprint_user');
      localStorage.removeItem('skillsprint_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser: verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
