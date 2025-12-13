import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '@/app/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile, role: profile?.role || null }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, profile: null, role: null }),
}));
