
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const actionCodeSettings = {
    url: typeof window !== 'undefined' ? window.location.href : 'http://localhost:9002',
    handleCodeInApp: true,
  };

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in successfully!" });
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({ 
          title: "Sign in cancelled", 
          description: "This may be due to an incomplete OAuth Consent Screen configuration in your Google Cloud project.", 
          variant: "destructive" 
        });
      } else if (error.code === 'auth/unauthorized-domain') {
         toast({ 
           title: "Sign in failed: Unauthorized Domain", 
           description: "This app's domain is not authorized for sign-in. Please add it in your Firebase project settings.", 
           variant: "destructive" 
          });
      }
      else {
        toast({ title: "Sign in failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
      }
    }
  }, [toast]);

  const signInWithEmail = useCallback(async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${email}.`,
      });
    } catch (error: any) {
      console.error('Error sending email link', error);
      toast({ title: "Sign in failed", description: error.message || "Could not send sign-in email.", variant: "destructive" });
    }
  }, [toast, actionCodeSettings]);

  const logOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out." });
    } catch (error) {
       console.error('Error signing out', error);
       toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            toast({ title: "Signed in successfully!" });
          })
          .catch((error) => {
            console.error('Error signing in with email link', error);
            toast({ title: "Sign in failed", description: "The sign-in link is invalid or has expired.", variant: "destructive" });
          });
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const value = { user, loading, signInWithGoogle, signInWithEmail, logOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
