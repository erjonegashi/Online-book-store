import { createContext, useContext, useState } from 'react';
import { setAdminToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored && !stored.role) return { ...stored, role: 'admin' };
      return stored;
    } catch { return null; }
  });

  const login = (userData, token) => {
    const u = { ...userData, role: 'admin' };
    setAdminToken(token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    // cookie admin_rt dërgohet automatikisht nga browser (credentials: 'include')
    await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/auth/logout`,
      { method: 'POST', credentials: 'include' }
    ).catch(() => {});
    setAdminToken(null);
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
