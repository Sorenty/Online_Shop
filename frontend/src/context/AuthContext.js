import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  useEffect(() => {
    // Если нужно, можно проверить токен на сервере при старте
  }, []);

  async function login(username, password) {
    const res = await api.post('/auth/signin', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    localStorage.setItem('role', res.data.role);
    setUser(res.data.username);
    setRole(res.data.role);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  }

  async function register(username, password) {
    const res = await api.post('/auth/signup', { username, password });
    return res.data;
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
