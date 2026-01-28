'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { Spinner } from '@/components/shared/spinner';

type AuthContextType = {
  user: User | null;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication
const MOCK_USERS: Record<string, User & { password: string }> = {
    'tecnico@email.com': { name: 'Técnico Fulano', email: 'tecnico@email.com', password: 'password' },
    'admin@email.com': { name: 'Admin', email: 'admin@email.com', password: 'admin' },
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = async ({ email, password }: any) => {
    setLoading(true);
    const foundUser = MOCK_USERS[email];
    if (foundUser && foundUser.password === password) {
      const userToStore = { name: foundUser.name, email: foundUser.email };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      router.push('/dashboard');
      return { success: true };
    } else {
        setLoading(false);
        return { success: false, message: 'Credenciais inválidas.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  if (loading || (!user && pathname !== '/login')) {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <Spinner />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
