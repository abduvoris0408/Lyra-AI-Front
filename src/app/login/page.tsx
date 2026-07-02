"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoogleIcon } from "@/components/brand/google-icon";
import { LyraMark } from "@/components/brand/lyra-mark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/language-provider";
import { ThemeToggleButton } from "@/components/theme/theme-toggle-button";
import { useAuth } from "@/hooks/use-auth";
import { isGoogleAuthEnabled, preloadAuth } from "@/lib/auth";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { signIn, loading, error } = useAuth();
  const user = useAuthStore((s) => s.user);
  const onboarded = useAuthStore((s) => s.onboarded);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && user) {
      router.replace(onboarded ? "/chat" : "/onboarding");
    }
  }, [hydrated, user, onboarded, router]);

  // Google skriptini oldindan yuklaymiz — iOS Safari'da popup faqat to'g'ridan
  // foydalanuvchi tegintirgan zahoti ochiladi, kechikish bo'lsa bloklanadi.
  useEffect(() => {
    preloadAuth();
  }, []);

  const handleSignIn = async () => {
    const u = await signIn();
    if (u) router.replace(onboarded ? "/chat" : "/onboarding");
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 -top-72 h-136 w-136 -translate-x-1/2 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          {t("common.home")}
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="lyra-fade-up w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
              <LyraMark className="h-8 w-8" />
            </span>
            <h1 className="mt-5 font-serif text-3xl font-medium text-ink">
              {t("login.title").replace("{app}", config.appName)}
            </h1>
            <p className="mt-2 text-muted">{t("login.subtitle")}</p>
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm font-medium text-ink transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              {loading ? t("login.signingIn") : t("login.googleButton")}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-accent">{error}</p>
            )}

            {!isGoogleAuthEnabled && (
              <p className="mt-4 rounded-lg bg-elevated px-3 py-2 text-center text-xs text-muted">
                {t("login.demoNote")}
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            {t("login.terms")}
          </p>
        </div>
      </main>
    </div>
  );
}
