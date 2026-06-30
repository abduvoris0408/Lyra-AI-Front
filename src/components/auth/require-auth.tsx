"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { getAuthService } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

/**
 * Himoyalangan sahifalar uchun o'rovchi.
 * - Kirilmagan bo'lsa → /login
 * - Onboarding tugamagan bo'lsa va talab qilinsa → /onboarding
 *
 * Backend rejimida sessiya server cookie'sida (httpOnly JWT). Sahifa ochilganda
 * getSession() orqali serverdan tasdiqlanadi — eskirgan/yo'q sessiya tozalanadi.
 */
export function RequireAuth({
  children,
  requireOnboarded = true,
}: {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const onboarded = useAuthStore((s) => s.onboarded);
  const hydrated = useAuthStore((s) => s.hydrated);

  // Server sessiyasini bir marta tekshiramiz (backend rejimida).
  useEffect(() => {
    if (!hydrated) return;
    const getSession = getAuthService().getSession;
    if (!getSession) return;
    let cancelled = false;
    void getSession().then((serverUser) => {
      if (cancelled) return;
      const store = useAuthStore.getState();
      if (serverUser) store.setUser(serverUser);
      else if (store.user) store.clear();
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
    } else if (requireOnboarded && !onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, user, onboarded, requireOnboarded, router]);

  if (!hydrated || !user || (requireOnboarded && !onboarded)) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="flex h-full items-center justify-center bg-canvas">
      <LyraMark className="h-10 w-10 animate-pulse text-accent" />
    </div>
  );
}
