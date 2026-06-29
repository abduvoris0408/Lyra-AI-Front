"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_LANG, LANG_KEY, translate, type Lang } from "@/lib/i18n";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Til provayderi. SSR mosligi uchun dastlab DEFAULT_LANG, mount'dan keyin
 * localStorage'dagi qiymatga o'tadi (hydration mismatch bo'lmaydi).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === "uz" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(LANG_KEY, next);
    setLangState(next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback((path: string) => translate(lang, path), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx)
    throw new Error("useI18n LanguageProvider ichida ishlatilishi kerak");
  return ctx;
}
