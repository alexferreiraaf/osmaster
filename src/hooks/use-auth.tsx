'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock user database. In a real app, you'd fetch this from Firebase Auth.
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'tecnico@email.com': {
    password: 'password',
    user: { name: 'Carlos Alberto', email: 'tecnico@email.com' },
  },
  'admin@email.com': {
    password: 'admin',
    user: { name: 'Admin', email: 'admin@email.com' },
  },
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // In a real Firebase app, you would use onAuthStateChanged here.
    // For now, we'll check local storage for a mock session.
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (pathname !== '/login') {
          router.push('/login');
        }
    } catch(e) {
        // Handle cases where localStorage is not available or parsing fails
        if (pathname !== '/login') {
            router.push('/login');
        }
    }
  }, [pathname, router]);

  const login = async (email: string, pass: string) => {
     // Mock authentication logic
    const potentialUser = MOCK_USERS[email];
    if (potentialUser && potentialUser.password === pass) {
      setUser(potentialUser.user);
      localStorage.setItem('user', JSON.stringify(potentialUser.user));
      router.push('/dashboard');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
