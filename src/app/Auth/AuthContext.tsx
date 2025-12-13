import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Profile } from '@/app/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, profile, isLoading, setUser, setSession, setProfile, setLoading, reset } = useAuthStore();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, sign out the user (orphaned session)
        if (error.code === 'PGRST116') {
          console.warn('Profile not found for user, signing out...');
          await supabase.auth.signOut();
          reset();
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [setProfile, setLoading, reset]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch profile
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        reset();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, setSession, setUser, setLoading, reset]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    reset();
  }, [reset]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    signOut,
  }), [user, session, profile, isLoading, signOut]);

  return (
    <AuthContext.Provider value={value}>
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
