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
    const publicRoutes = ['/', '/login', '/register'];
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/');
    }
    if (!loading && user && publicRoutes.includes(pathname)) {
      router.push('/dashboard');
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
        let message = 'Credenciais inválidas ou erro no login.';
        if (error.code === 'auth/invalid-credential') {
            message = 'E-mail ou senha inválidos.';
        } else if (error.code === 'auth/api-key-not-valid') {
             message = 'Chave de API inválida. Verifique sua configuração do Firebase em src/firebase/config.ts.';
        }
        return { success: false, message };
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
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este e-mail já está em uso.';
                break;
            case 'auth/weak-password':
                message = 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Cadastro por e-mail/senha não está ativado no Firebase Console.';
                break;
            case 'auth/api-key-not-valid':
                message = 'Chave de API inválida. Verifique sua configuração do Firebase em src/firebase/config.ts.';
                break;
            default:
                message = error.message; // Use a mensagem de erro do Firebase se for outra coisa
                break;
        }
        return { success: false, message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const publicRoutes = ['/', '/login', '/register'];
  if (loading || (!user && !publicRoutes.includes(pathname))) {
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
