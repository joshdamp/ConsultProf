import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isLoading: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isLoading: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
