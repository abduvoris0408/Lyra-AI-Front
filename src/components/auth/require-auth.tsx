"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthService } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

/**
 * Himoyalangan sahifalar uchun o'rovchi.
 * - Kirilmagan bo'lsa → /login
 * - Onboarding tugamagan bo'lsa va talab qilinsa → /onboarding
 *
 * Backend rejimida sessiya server cookie'sida (httpOnly JWT). Sahifa ochilganda
 * getSession() orqali serverdan tasdiqlanadi. MUHIM: bu tekshiruv tugaguncha
 * /login ga yo'naltirmaymiz — aks holda cookie tekshirilishidan oldin
 * (user hali null bo'lganda) login'ga uloqtirilib qolinadi.
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

  // Server sessiyasi tekshirilyaptimi? Tugaguncha hech qayerga yo'naltirmaymiz.
  const [checking, setChecking] = useState(true);

  // Server sessiyasini bir marta tekshiramiz (backend rejimida).
  useEffect(() => {
    if (!hydrated) return;
    const getSession = getAuthService().getSession;
    if (!getSession) {
      // Demo/mijoz rejimi — server tekshiruvi yo'q, lokal holatga ishonamiz.
      setChecking(false);
      return;
    }
    let cancelled = false;
    void getSession().then((serverUser) => {
      if (cancelled) return;
      const store = useAuthStore.getState();
      if (serverUser) store.setUser(serverUser);
      else if (store.user) store.clear();
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || checking) return;
    if (!user) {
      router.replace("/login");
    } else if (requireOnboarded && !onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, checking, user, onboarded, requireOnboarded, router]);

  if (!hydrated || checking || !user || (requireOnboarded && !onboarded)) {
    return (
      <div className="flex h-full min-h-dvh items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
