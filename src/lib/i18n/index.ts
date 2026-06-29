import { dictionaries, type Lang } from "./translations";

export const LANG_KEY = "lyra-lang";
export const DEFAULT_LANG: Lang = "uz";

/** Nuqtali yo'l bo'yicha tarjimani oladi: t("landing.title1"). */
export function translate(lang: Lang, path: string): string {
  const fromLang = resolve(dictionaries[lang], path);
  if (typeof fromLang === "string") return fromLang;
  // Fallback: o'zbekcha, keyin kalitning o'zi
  const fromDefault = resolve(dictionaries[DEFAULT_LANG], path);
  return typeof fromDefault === "string" ? fromDefault : path;
}

function resolve(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const v = window.localStorage.getItem(LANG_KEY);
  return v === "uz" || v === "en" ? v : DEFAULT_LANG;
}

export { dictionaries, LANGUAGES } from "./translations";
export type { Lang } from "./translations";
