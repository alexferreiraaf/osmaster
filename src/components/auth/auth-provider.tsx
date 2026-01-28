'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { Spinner } from '@/components/shared/spinner';
import { auth } from '@/firebase'; // Import real auth instance
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  login: (credentials: any) => Promise<any>;
  register: (credentials: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            setUser({
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
            });
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = async ({ email, password }: any) => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
        return { success: true };
    } catch (error: any) {
        setLoading(false);
        return { success: false, message: 'Credenciais inválidas ou erro no login.' };
    }
  };

  const register = async ({ name, email, password }: any) => {
    setLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Manually setting user here to update UI immediately
        setUser({ name: name, email: email });
        
        router.push('/dashboard');
        return { success: true };
    } catch (error: any) {
        setLoading(false);
        let message = 'Falha ao criar conta. Tente novamente.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este e-mail já está em uso.';
        }
        return { success: false, message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  if (loading || (!user && pathname !== '/login' && pathname !== '/register')) {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <Spinner />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
