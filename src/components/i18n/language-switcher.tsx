"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/i18n";
import { useI18n } from "./language-provider";

/** Header'lar uchun ixcham til tanlagich (dropdown). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    // pointerdown — sichqoncha va sensorli ekran (mobil) ikkalasini qamrab oladi
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Til"
        className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft transition hover:bg-elevated"
      >
        <Globe size={16} />
        {current.code.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-elevated"
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-ink">{l.label}</span>
              {l.code === lang && <Check size={15} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
