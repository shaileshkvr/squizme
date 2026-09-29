import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasLocalApiKey } from '../utils/crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hasCustomKey: boolean;
  freeGenerationsRemaining: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          ...data,
          hasCustomKey: data.hasCustomKey || hasLocalApiKey()
        });
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token) refreshProfile();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser({
      ...newUser,
      hasCustomKey: newUser.hasCustomKey || hasLocalApiKey()
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateName = async (newName: string) => {
    if (!token) return;
    const res = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update name');
    setUser((prev) => (prev ? { ...prev, name: newName } : null));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return;
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshProfile, updateName, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
