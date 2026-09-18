import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: { name?: string; phone?: string; department?: string }) => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getCurrentUser());

  useEffect(() => {
    const current = storageService.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (email: string, password = ''): Promise<User> => {
    const loggedUser = await api.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name: string, email: string, password = '', phone = ''): Promise<User> => {
    const newUser = await api.register(name, email, password, phone);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = (updates: { name?: string; phone?: string; department?: string }) => {
    if (!user) return;
    const updated = storageService.updateUserProfile(user.id, updates);
    if (updated) {
      setUser(updated);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const allUsers = storageService.getUsers();
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      storageService.setCurrentUser(target);
      setUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
