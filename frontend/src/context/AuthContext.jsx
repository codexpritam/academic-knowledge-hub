import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = async (formData) => {
    const response = await authService.register(formData);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Login
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Google Login Token
  const loginWithGoogle = async (credential) => {
    const response = await authService.verifyGoogleToken(credential);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  // Update user in local state
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
