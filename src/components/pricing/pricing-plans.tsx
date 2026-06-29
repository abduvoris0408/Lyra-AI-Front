"use client";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

type PlanId = "free" | "pro" | "max";

interface PlanDef {
  id: PlanId;
  icon: React.ReactNode;
  features: string[];
  featured?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    icon: <Sparkles size={18} />,
    features: ["free1", "free2", "free3", "free4"],
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

/**
 * Yagona narxlar bloki — landing sahifasida ham, /plans sahifasida ham
 * bir xil ko'rinadi. `mode`:
 *  - "landing": CTA'lar /login ga olib boradi.
 *  - "account": Bepul reja "joriy reja" deb belgilanadi, qolganlar tugma.
 */
export function PricingPlans({
  mode = "landing",
}: {
  mode?: "landing" | "account";
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} mode={mode} />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  mode,
}: {
  plan: PlanDef;
  mode: "landing" | "account";
}) {
  const { t } = useI18n();
  const name = t(`pricing.${plan.id}Name`);
  const price = t(`pricing.${plan.id}Price`);
  const desc = t(`pricing.${plan.id}Desc`);
  const cta = t(`pricing.${plan.id}Cta`);
  const isCurrent = mode === "account" && plan.id === "free";

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
          <li key={k} className="flex items-start gap-2.5 text-sm text-ink-soft">
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

      {isCurrent ? (
        <span className="mt-7 flex items-center justify-center rounded-full border border-line-strong bg-elevated px-6 py-3 text-sm font-medium text-muted">
          {t("pricing.currentPlan")}
        </span>
      ) : mode === "landing" ? (
        <Link
          href="/login"
          className={cn(
            "mt-7 flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition",
            plan.featured
              ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
              : "border border-line-strong bg-surface text-ink hover:bg-elevated",
          )}
        >
          {cta}
        </Link>
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
