"use client";

import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

type Plan = {
  id: "free" | "pro" | "max";
  icon: React.ReactNode;
  features: string[];
  featured?: boolean;
  current?: boolean;
};

export default function PlansPage() {
  const { t } = useI18n();
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: "free",
      icon: <Sparkles size={18} />,
      features: ["free1", "free2", "free3", "free4"],
      current: true,
    },
    {
      id: "pro",
      icon: <Zap size={18} />,
      features: ["pro1", "pro2", "pro3", "pro4", "pro5"],
      featured: true,
    },
    {
      id: "max",
      icon: <Crown size={18} />,
      features: ["max1", "max2", "max3", "max4", "max5"],
    },
  ];

  return (
    <div className="relative flex min-h-full flex-col">
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

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </main>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  const name = t(`pricing.${plan.id}Name`);
  const price = t(`pricing.${plan.id}Price`);
  const desc = t(`pricing.${plan.id}Desc`);
  const cta = t(`pricing.${plan.id}Cta`);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border bg-surface p-7 transition",
        plan.featured
          ? "border-2 border-accent shadow-lg md:-translate-y-2"
          : "border-line hover:border-line-strong",
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white shadow">
          <Sparkles size={12} />
          {t("pricing.mostPopular")}
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            plan.featured
              ? "bg-accent text-white"
              : "bg-accent-soft text-accent",
          )}
        >
          {plan.icon}
        </span>
        <h3 className="text-lg font-semibold text-ink">{name}</h3>
      </div>

      <p className="mt-3 text-sm text-muted">{desc}</p>

      <div className="mt-5 flex items-end gap-1">
        <span className="font-serif text-4xl font-medium text-ink">{price}</span>
        <span className="mb-1.5 text-sm text-muted">{t("pricing.monthly")}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((k) => (
          <li
            key={k}
            className="flex items-start gap-2.5 text-sm text-ink-soft"
          >
            <Check
              size={17}
              className={cn(
                "mt-0.5 shrink-0",
                plan.featured ? "text-accent" : "text-muted",
              )}
            />
            {t(`pricing.${k}`)}
          </li>
        ))}
      </ul>

      {plan.current ? (
        <span className="mt-7 flex items-center justify-center rounded-full border border-line-strong bg-elevated px-6 py-3 text-sm font-medium text-muted">
          {t("pricing.currentPlan")}
        </span>
      ) : (
        <button
          className={cn(
            "mt-7 flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition",
            plan.featured
              ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
              : "border border-line-strong bg-surface text-ink hover:bg-elevated",
          )}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
