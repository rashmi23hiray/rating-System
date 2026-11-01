import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('store_rating_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('store_rating_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(res => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('store_rating_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('store_rating_token', res.token);
      localStorage.setItem('store_rating_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('store_rating_token', res.token);
      localStorage.setItem('store_rating_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('store_rating_token');
    localStorage.removeItem('store_rating_user');
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await api.changePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
