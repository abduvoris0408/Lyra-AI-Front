"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { config } from "@/lib/config";

export default function PlansPage() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 -top-80 h-152 w-152 -translate-x-1/2 rounded-full bg-accent-soft opacity-70 blur-3xl" />
      </div>

      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-20 border-b border-line/40 bg-canvas/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-elevated hover:text-ink"
          >
            <ArrowLeft size={17} />
            {t("pricing.back")}
          </button>
          <Link href="/chat" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <LyraMark className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-medium text-ink">
              {config.appName}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
            <Sparkles size={12} />
            {t("nav.pricing")}
          </span>
          <h1 className="font-serif text-3xl font-medium text-ink md:text-4xl">
            {t("pricing.plansTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            {t("pricing.plansSubtitle")}
          </p>
        </div>

        <div className="mt-12">
          <PricingPlans mode="account" />
        </div>
      </main>
    </div>
  );
}
