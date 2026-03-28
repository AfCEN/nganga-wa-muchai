import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function signup(email, password, displayName, inviteCode) {
    const data = await api.post('/api/auth/signup', { email, password, displayName, inviteCode });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function setup(email, password, displayName) {
    const data = await api.post('/api/auth/setup', { email, password, displayName });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('access_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, signup, setup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
