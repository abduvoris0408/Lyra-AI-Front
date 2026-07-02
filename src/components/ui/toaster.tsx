"use client";

import { AlertCircle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ToastVariant, useToastStore } from "@/store/toast-store";

const ICONS: Record<ToastVariant, typeof Check> = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: "bg-accent-soft text-accent",
  error: "bg-destructive/15 text-destructive",
  info: "bg-elevated text-ink-soft",
};

/**
 * Yuqori-markazdan chiqadigan toast bildirishnomalari. Nusxalash, ulashish,
 * suhbatni o'chirish kabi amallardan so'ng qisqa tasdiq ko'rsatadi.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="lyra-toast-in pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border border-line bg-surface/90 py-2 pl-2 pr-4 text-sm font-medium text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)] backdrop-blur-md"
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                ICON_STYLES[t.variant],
              )}
            >
              <Icon size={14} strokeWidth={2.5} />
            </span>
            <span className="truncate">{t.message}</span>
          </button>
        );
      })}
    </div>
  );
}
