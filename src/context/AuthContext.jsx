import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('branch-user');
    const token = localStorage.getItem('branch-token');
    if (saved && token) {
      try {
        const parsed = JSON.parse(saved);
        if (['superAdmin', 'admin'].includes(parsed?.role)) {
          setUser(parsed);
          // Sync latest profile
          api.get('/profile').then(res => {
            const latest = res.data?.data?.user || res.data?.data?.admin;
            if (latest) {
              const updated = { ...parsed, ...latest, token };
              setUser(updated);
              localStorage.setItem('branch-user', JSON.stringify(updated));
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    if (!['superAdmin', 'admin'].includes(userData?.role)) return;
    setUser(userData);
    localStorage.setItem('branch-user', JSON.stringify(userData));
    localStorage.setItem('branch-token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('branch-user');
    localStorage.removeItem('branch-token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
