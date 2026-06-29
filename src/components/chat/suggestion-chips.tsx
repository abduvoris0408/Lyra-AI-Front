"use client";

import { Code2, FileText, ListChecks, Sparkles } from "lucide-react";
import { useI18n } from "@/components/i18n/language-provider";

const ICONS = [ListChecks, FileText, Code2, Sparkles];

export function SuggestionChips({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useI18n();
  const items = [
    t("chat.suggestion1"),
    t("chat.suggestion2"),
    t("chat.suggestion3"),
    t("chat.suggestion4"),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((s, i) => {
        const Icon = ICONS[i];
        return (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-soft transition hover:border-line-strong hover:bg-elevated"
          >
            <Icon size={15} className="text-accent" />
            {s}
          </button>
        );
      })}
    </div>
  );
}
