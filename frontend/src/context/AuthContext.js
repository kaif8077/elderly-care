import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

// Restores and exposes the signed-in user's session to protected member pages.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('elderlyCareUser')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('elderlyCareUser', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('elderlyCareUser');
  }, []);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return undefined;
    }

    api
      .get('/api/auth/me')
      .then(({ data }) => {
        if (active) {
          setUser(data.user);
          localStorage.setItem('elderlyCareUser', JSON.stringify(data.user));
        }
      })
      .catch((error) => {
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem('token');
          localStorage.removeItem('elderlyCareUser');
          if (active) setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
