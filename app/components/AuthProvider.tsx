'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { Loader2 } from 'lucide-react';
interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
}
const AuthContext = createContext<AuthContextType>({ currentUser: null, isLoadingAuth: true });
export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      console.log("Auth State Changed:", user ? `User: ${user.uid}` : "No user");
    });
    return () => unsubscribe();
  }, []);
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
      </div>
    );
  }
  const value = { currentUser, isLoadingAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}