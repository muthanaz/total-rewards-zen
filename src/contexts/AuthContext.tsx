import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'employee' | 'employer' | 'admin' | 'vendor';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        setRole('employee');
      } else {
        setRole(data?.role as UserRole || 'employee');
      }
    } catch (error) {
      console.error('Error:', error);
      setRole('employee');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const demoLogin = async (demoRole: UserRole) => {
    // Block demo login in production environment
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const devHostnames = ['localhost', '127.0.0.1', 'lovableproject.com'];
    const isDevHost = devHostnames.some(dev => hostname.includes(dev) || hostname === dev);
    
    if (!isDevHost) {
      return { error: new Error('Demo login is not available in production') };
    }

    const emailMap: Record<UserRole, string> = {
      employee: 'demo.employee@bnft.ae',
      employer: 'demo.employer@bnft.ae',
      admin: 'demo.admin@bnft.ae',
      vendor: 'demo.vendor@bnft.ae',
    };
    
    const nameMap: Record<UserRole, { first: string; last: string }> = {
      employee: { first: 'Demo', last: 'Employee' },
      employer: { first: 'HR', last: 'Manager' },
      admin: { first: 'Platform', last: 'Admin' },
      vendor: { first: 'Vendor', last: 'Partner' },
    };
    
    const email = emailMap[demoRole];
    const password = 'demo123456';
    
    // Try to sign in first
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    
    // If user doesn't exist, create them
    if (error?.message?.includes('Invalid login credentials')) {
      const { error: signUpError } = await signUp(
        email, 
        password, 
        nameMap[demoRole].first, 
        nameMap[demoRole].last,
        demoRole
      );
      
      if (signUpError) {
        return { error: signUpError };
      }
      
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try signing in again
      const result = await supabase.auth.signInWithPassword({ email, password });
      return { error: result.error };
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut, demoLogin }}>
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