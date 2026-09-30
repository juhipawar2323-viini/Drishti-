import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('drishti_auth_token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => !localStorage.getItem('drishti_auth_token'));

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setIsGuest(false);
          }
        } catch (err) {
          console.warn('Session verification failed, continuing in guest mode:', err.message);
          localStorage.removeItem('drishti_auth_token');
          setToken(null);
          setUser(null);
          setIsGuest(true);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('drishti_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.success && res.token) {
      localStorage.setItem('drishti_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('drishti_auth_token');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const continueAsGuest = () => {
    localStorage.removeItem('drishti_auth_token');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const updateUserPreferences = async (newPrefs) => {
    if (user && token) {
      try {
        const res = await authApi.updatePreferences(newPrefs);
        if (res.success) {
          setUser(prev => ({ ...prev, preferences: res.preferences }));
        }
      } catch (err) {
        console.warn('Could not sync preferences with cloud:', err.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGuest,
        login,
        register,
        logout,
        continueAsGuest,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
