import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  typ?: string;
  id?: number;
  role?: string;
  name: string;
  sub?: string;
  email: string;
  profile?: string;
  profile_bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-store',
    }
  )
);
