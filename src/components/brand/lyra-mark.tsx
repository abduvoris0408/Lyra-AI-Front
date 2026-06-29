import { Sparkles } from "lucide-react";

/**
 * Lyra brend belgisi — Sparkles (uchqun) ikonkasi.
 * currentColor bilan ranglanadi, className orqali o'lchamlanadi.
 */
export function LyraMark({ className }: { className?: string }) {
  return <Sparkles className={className} aria-hidden="true" />;
}
