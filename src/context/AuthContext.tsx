import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../config/firebase';
import type { UserProfile } from '../types/kanban';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'kanban_demo_active';

export const DEMO_USER: UserProfile = {
  uid: 'demo-user',
  displayName: 'Usuário Demonstrativo',
  email: 'demo@kanban.app',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  isDemo: true,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let resolved = false;

    // Timeout de segurança de 2 segundos caso o Firebase Auth demore
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const isDemo = localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
        if (isDemo) {
          setUser(DEMO_USER);
          setIsDemoMode(true);
        }
        setLoading(false);
      }
    }, 2000);

    // Verificar se Modo Demo foi ativado previamente
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
    if (savedDemo) {
      setUser(DEMO_USER);
      setIsDemoMode(true);
      setLoading(false);
      resolved = true;
      clearTimeout(timeoutId);
      return;
    }

    if (!hasFirebaseConfig || !auth) {
      setLoading(false);
      resolved = true;
      clearTimeout(timeoutId);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
      }
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isDemo: false,
        });
        setIsDemoMode(false);
      } else if (!savedDemo) {
        setUser(null);
        setIsDemoMode(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!hasFirebaseConfig || !auth) {
      throw new Error('Firebase não está configurado. Por favor, utilize o Modo Demonstrativo.');
    }
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsDemo = () => {
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    setUser(DEMO_USER);
    setIsDemoMode(true);
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    setUser(null);
    if (auth && auth.currentUser) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        loginWithGoogle,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
