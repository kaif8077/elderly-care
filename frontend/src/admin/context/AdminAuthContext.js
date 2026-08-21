import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import adminApi from '../../services/adminApi';

export const AdminAuthContext = createContext(null);

// Restores the secure admin session and exposes admin login/logout actions.
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState('');

  const restoreSession = useCallback(async () => {
    try {
      const response = await adminApi.get('/auth/me');
      setAdmin(response.data.admin);
    } catch (error) {
      setAdmin(null);
      if (error.response?.data?.code === 'ADMIN_SESSION_EXPIRED') {
        setSessionMessage('Your admin session expired. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (credentials) => {
    const response = await adminApi.post('/auth/login', credentials);
    setAdmin(response.data.admin);
    setSessionMessage('');
    return response.data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/auth/logout');
    } finally {
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      login,
      logout,
      restoreSession,
      sessionMessage,
      setSessionMessage
    }),
    [admin, loading, login, logout, restoreSession, sessionMessage]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
