import { createContext, useContext, useState } from 'react';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user_data'));
      if (stored && !stored.role) return { ...stored, role: 'user' };
      return stored;
    } catch { return null; }
  });

  const login = (userData, token) => {
    const u = { ...userData, role: 'user' };
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    // cookie user_rt dërgohet automatikisht nga browser (credentials: 'include')
    await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/logout`,
      { method: 'POST', credentials: 'include' }
    ).catch(() => {});
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated, role: 'user' };
    localStorage.setItem('user_data', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <UserAuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => useContext(UserAuthContext);
