import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind klasslarni xavfsiz birlashtirish. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Brauzer va serverda ishlaydigan ID generator. */
export function uid(prefix = ""): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return prefix + crypto.randomUUID();
  }
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Suhbat nomini birinchi xabardan avtomatik yasash. */
export function deriveTitle(text: string, max = 48): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "Yangi suhbat";
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}
