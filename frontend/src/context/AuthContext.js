import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vexa_token');
    const savedUser = localStorage.getItem('vexa_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authService.getMe()
          .then(res => setUser(res.data.user))
          .catch(() => {
            localStorage.removeItem('vexa_token');
            localStorage.removeItem('vexa_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('vexa_token', token);
    localStorage.setItem('vexa_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('vexa_token');
    localStorage.removeItem('vexa_user');
    setUser(null);
  };

  const isAdmin = () => user?.rol_nombre === 'admin';
  const isVendedor = () => user?.rol_nombre === 'vendedor' || user?.rol_nombre === 'admin';
  const isCliente = () => user?.rol_nombre === 'cliente';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isVendedor, isCliente }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
