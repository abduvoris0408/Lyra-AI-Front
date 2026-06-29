"use client";

import {
  ArrowRight,
  Code2,
  Lightbulb,
  type LucideIcon,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

const STEP_ICONS: LucideIcon[] = [
  Sparkles,
  MessageSquareText,
  Code2,
  Lightbulb,
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, hydrated, onboarded, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (onboarded) router.replace("/chat");
  }, [hydrated, user, onboarded, router]);

  if (!hydrated || !user || onboarded) {
    return <div className="h-full bg-canvas" />;
  }

  const steps = [
    {
      title: t("onboarding.s1Title").replace("{app}", config.appName),
      text: t("onboarding.s1Text"),
    },
    { title: t("onboarding.s2Title"), text: t("onboarding.s2Text") },
    { title: t("onboarding.s3Title"), text: t("onboarding.s3Text") },
    { title: t("onboarding.s4Title"), text: t("onboarding.s4Text") },
  ];

  const current = steps[step];
  const Icon = STEP_ICONS[step];
  const isLast = step === steps.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace("/chat");
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-canvas px-6 py-10">
      <div className="w-full max-w-md">
        <div
          key={step}
          className="lyra-fade-up rounded-3xl border border-line bg-surface p-8 text-center shadow-sm"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Icon size={30} />
          </span>
          <h1 className="mt-6 font-serif text-2xl font-medium text-ink">
            {current.title}
          </h1>
          <p className="mt-3 text-muted">{current.text}</p>

          <div className="mt-8 flex justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-6 bg-accent" : "w-1.5 bg-line-strong",
                )}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={finish}
              className="text-sm text-muted transition hover:text-ink"
            >
              {t("common.skip")}
            </button>
            <button
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="group flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              {isLast ? t("common.start") : t("common.next")}
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <LyraMark className="h-4 w-4 text-accent" />
          {config.appName}
        </div>
      </div>
    </div>
  );
}
