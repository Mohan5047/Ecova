import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: { name?: string; phone?: string; department?: string }) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session on initial load
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const profile = await api.getProfile();
        if (isMounted && profile) {
          setUser(profile);
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore notice:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
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
    api.logout();
    setUser(null);
  };

  const updateProfile = async (updates: { name?: string; phone?: string; department?: string }) => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({
        fullName: updates.name,
        phone: updates.phone,
      });
      setUser(updated);
    } catch (err) {
      console.error('[AuthContext] Failed to update profile:', err);
      throw err;
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      citizen: { email: 'citizen@ecova.org', pass: 'Citizen@123' },
      authority: { email: 'authority@ecova.org', pass: 'Authority@123' },
      admin: { email: 'admin@ecova.org', pass: 'Admin@123' },
    };

    const creds = demoCredentials[role];
    if (creds) {
      const logged = await api.login(creds.email, creds.pass);
      setUser(logged);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
