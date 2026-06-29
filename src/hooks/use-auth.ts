"use client";

import { useCallback, useState } from "react";
import { getAuthService } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const onboarded = useAuthStore((s) => s.onboarded);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const clear = useAuthStore((s) => s.clear);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await getAuthService().signInWithGoogle();
      setUser(u);
      return u;
    } catch (err) {
      setError((err as Error)?.message ?? "Kirishda xatolik");
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const signOut = useCallback(async () => {
    await getAuthService().signOut().catch(() => {});
    clear();
  }, [clear]);

  return {
    user,
    onboarded,
    hydrated,
    loading,
    error,
    signIn,
    signOut,
    completeOnboarding,
  };
}
