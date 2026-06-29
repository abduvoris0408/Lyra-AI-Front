import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/auth/types";

interface AuthState {
  user: AuthUser | null;
  onboarded: boolean;
  /** Hydration tugaganini bildiradi (guard'lar uchun). */
  hydrated: boolean;

  setUser: (user: AuthUser) => void;
  completeOnboarding: () => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      onboarded: false,
      hydrated: false,

      setUser: (user) => set({ user }),
      completeOnboarding: () => set({ onboarded: true }),
      clear: () => set({ user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "lyra-auth",
      partialize: (s) => ({ user: s.user, onboarded: s.onboarded }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
