"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

/** Yorug'/qorong'i o'rtasida tez almashtiruvchi tugma (header'lar uchun). */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
      className={
        className ??
        "flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-elevated"
      }
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
