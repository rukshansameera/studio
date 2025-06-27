"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      toast({
        title: "Firebase Not Configured",
        description: "Please add your Firebase credentials to the .env.local file to enable authentication.",
        variant: "destructive",
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/profile');
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (error.code && (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid')) {
         toast({
            title: "Authentication Error",
            description: "Your Firebase API key is invalid. Please check your .env.local file.",
            variant: "destructive",
        });
      } else if (error.code === 'auth/configuration-not-found') {
        toast({
            title: "Configuration Error",
            description: "Google Sign-In is not enabled for this Firebase project. Please enable it in the Firebase console.",
            variant: "destructive",
        });
      } else {
        toast({
            title: "Authentication Error",
            description: "Failed to sign in with Google. Please try again.",
            variant: "destructive",
        });
      }
    }
  };

  const signOut = async () => {
    if (!auth) {
       toast({
        title: "Firebase Not Configured",
        description: "Cannot sign out as Firebase is not configured.",
        variant: "destructive",
      });
      return;
    }
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out", error);
       toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
