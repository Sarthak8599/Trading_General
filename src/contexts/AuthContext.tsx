import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { LocalAuthService, LocalUser } from '../lib/localAuth';

interface AuthContextType {
  user: User | LocalUser | null;
  loading: boolean;
  isLocalAuth: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  switchToLocalAuth: () => void;
  switchToSupabaseAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalAuth, setIsLocalAuth] = useState(false);

  useEffect(() => {
    // Check if local auth is active
    if (LocalAuthService.isLocalAuth()) {
      const localUser = LocalAuthService.getCurrentUser();
      setUser(localUser);
      setIsLocalAuth(true);
      setLoading(false);
      return;
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLocalAuth(false);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!LocalAuthService.isLocalAuth()) {
        setUser(session?.user ?? null);
        setIsLocalAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Use only Supabase auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (isLocalAuth) {
      LocalAuthService.signOut();
      setUser(null);
      setIsLocalAuth(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  const switchToLocalAuth = () => {
    LocalAuthService.signOut();
    setUser(null);
    setIsLocalAuth(true);
    setLoading(false);
  };

  const switchToSupabaseAuth = () => {
    LocalAuthService.signOut();
    setUser(null);
    setIsLocalAuth(false);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    isLocalAuth,
    signUp,
    signIn,
    signOut,
    switchToLocalAuth,
    switchToSupabaseAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
