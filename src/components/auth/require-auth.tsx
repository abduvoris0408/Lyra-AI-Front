"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useAuthStore } from "@/store/auth-store";

/**
 * Himoyalangan sahifalar uchun o'rovchi.
 * - Kirilmagan bo'lsa → /login
 * - Onboarding tugamagan bo'lsa va talab qilinsa → /onboarding
 *
 * Eslatma: sessiya hozir mijoz tomonda (localStorage). NestJS tayyor bo'lganda
 * server-side cookie tekshiruvi (middleware) qo'shiladi.
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
