"use client";

import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";

export function Greeting() {
  const { t } = useI18n();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  const h = new Date().getHours();
  const greetingKey =
    h < 6
      ? "chat.greetingNight"
      : h < 12
        ? "chat.greetingMorning"
        : h < 18
          ? "chat.greetingAfternoon"
          : "chat.greetingEvening";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
        <LyraMark className="h-7 w-7" />
      </div>
      <h1 className="font-serif text-3xl font-medium text-ink md:text-4xl">
        {t(greetingKey)}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-2 text-muted">{t("chat.greetingQuestion")}</p>
    </div>
  );
}
