import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'employee' | 'employer' | 'admin' | 'vendor';

type RoleStatus = 'loading' | 'loaded' | 'error' | 'unavailable';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  roleStatus: RoleStatus;
  organizationId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<{ error: Error | null }>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cached role to avoid repeated fetches within the same session
let cachedRole: { userId: string; role: UserRole; orgId: string | null } | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleStatus, setRoleStatus] = useState<RoleStatus>('loading');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoleAndOrg = useCallback(async (userId: string) => {
    // Check cache first
    if (cachedRole && cachedRole.userId === userId) {
      setRole(cachedRole.role);
      setOrganizationId(cachedRole.orgId);
      setRoleStatus('loaded');
      setLoading(false);
      return;
    }

    try {
      setRoleStatus('loading');
      
      // Fetch role from user_roles table (authoritative source)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        // Set role to null and status to error - don't silently default to employee
        setRole(null);
        setRoleStatus('error');
        setLoading(false);
        return;
      }

      // Fetch organization_id from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      const fetchedRole = (roleData?.role as UserRole) || null;
      const fetchedOrgId = profileData?.organization_id || null;

      // Cache the result
      cachedRole = { userId, role: fetchedRole!, orgId: fetchedOrgId };

      setRole(fetchedRole);
      setOrganizationId(fetchedOrgId);
      setRoleStatus(fetchedRole ? 'loaded' : 'unavailable');
    } catch (error) {
      console.error('Error in fetchUserRoleAndOrg:', error);
      setRole(null);
      setRoleStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user) {
      // Clear cache to force refresh
      cachedRole = null;
      await fetchUserRoleAndOrg(user.id);
    }
  }, [user, fetchUserRoleAndOrg]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid race condition with Supabase auth
          setTimeout(() => {
            fetchUserRoleAndOrg(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setRoleStatus('loading');
          setOrganizationId(null);
          cachedRole = null;
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoleAndOrg(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRoleAndOrg]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userRole: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: userRole,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    cachedRole = null;
    await supabase.auth.signOut();
  };

  const demoLogin = async (demoRole: UserRole) => {
    // Demo credentials - these demo users should already exist with correct roles
    const emailMap: Record<UserRole, string> = {
      employee: 'demo.employee@bnft.ae',
      employer: 'demo.employer@bnft.ae',
      admin: 'demo.admin@bnft.ae',
      vendor: 'demo.vendor@bnft.ae',
    };
    
    const email = emailMap[demoRole];
    const password = 'demo123456';
    
    // First, try to sign in
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    
    // If user doesn't exist, we need to create them
    if (error?.message?.includes('Invalid login credentials')) {
      const nameMap: Record<UserRole, { first: string; last: string }> = {
        employee: { first: 'Demo', last: 'Employee' },
        employer: { first: 'HR', last: 'Manager' },
        admin: { first: 'Platform', last: 'Admin' },
        vendor: { first: 'Vendor', last: 'Partner' },
      };
      
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: nameMap[demoRole].first,
            last_name: nameMap[demoRole].last,
            role: demoRole,
          },
        },
      });
      
      if (signUpError) {
        return { error: signUpError };
      }

      // Wait for the trigger to create the profile and role
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now fix the role if needed using the RPC function
      if (signUpData.user) {
        try {
          await supabase.rpc('ensure_demo_user_role', {
            p_email: email,
            p_role: demoRole,
          });
        } catch (rpcError) {
          console.warn('Could not ensure demo role via RPC:', rpcError);
        }
      }
      
      // Try signing in again
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      // Clear cache to force fresh role fetch
      cachedRole = null;
      
      return { error: result.error };
    }
    
    // Clear cache to force fresh role fetch on successful login
    cachedRole = null;
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      role, 
      roleStatus,
      organizationId,
      loading, 
      signIn, 
      signUp, 
      signOut, 
      demoLogin,
      refreshRole 
    }}>
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
