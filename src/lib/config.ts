/**
 * Ilova konfiguratsiyasi — barchasi environment'dan o'qiladi.
 * Hech narsa hardcode emas: ulanishlar o'zgarganda faqat .env o'zgaradi.
 */

export interface ModelOption {
  id: string;
  label: string;
  description: string;
}

/**
 * Chat oqimi qayerdan keladi:
 *  - "route"   : Next.js server route (/api/chat) Gemini'ga ulanadi (kalit serverda).
 *  - "backend" : tashqi NestJS backend (NEXT_PUBLIC_API_URL) SSE qaytaradi.
 *  - "mock"    : backendsiz UI sinovi.
 */
export type ChatMode = "route" | "backend" | "mock";

function resolveChatMode(): ChatMode {
  const explicit = process.env.NEXT_PUBLIC_CHAT_MODE as ChatMode | undefined;
  if (explicit === "route" || explicit === "backend" || explicit === "mock") {
    return explicit;
  }
  // Avtomatik: tashqi backend manzili bo'lsa — backend, aks holda Gemini route.
  return process.env.NEXT_PUBLIC_API_URL ? "backend" : "route";
}

const chatMode = resolveChatMode();

export const config = {
  appName: "Lyra AI",
  tagline: "Aqlli suhbat yordamchingiz",
  description:
    "Lyra — savollaringizga javob beradigan, yozish va kod tuzishda yordam beradigan aqlli sun'iy intellekt yordamchisi.",

  /** Tashqi backend (NestJS) bazaviy manzili. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  /** Saytning to'liq URL'i (SEO, openGraph, sitemap uchun). */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  chatMode,

  /** Google OAuth client ID (public). Bo'sh bo'lsa — demo kirish ishlatiladi. */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  defaultModelId: "gemini-flash-latest",

  /**
   * Foydalanuvchiga ko'rinadigan nomlar — to'liq "Lyra" brendida.
   * `id` ichki model identifikatori (server route shu bilan chaqiradi),
   * `label`/`description` esa hech qachon asl provayder nomini ko'rsatmaydi.
   *
   * "latest" aliaslari ishlatildi — modellar yangilansa, kod o'zgarmasdan
   * avtomatik eng so'nggi versiyaga o'tadi (dinamik, kelajakka tayyor).
   */
  models: [
    {
      id: "gemini-flash-latest",
      label: "Lyra Flash",
      description: "Tez va samarali — kundalik suhbatlar uchun",
    },
    {
      id: "gemini-pro-latest",
      label: "Lyra Pro",
      description: "Eng kuchli — murakkab vazifalar uchun",
    },
    {
      id: "gemini-flash-lite-latest",
      label: "Lyra Mini",
      description: "Yengil va tez — oddiy savollar uchun",
    },
  ] satisfies ModelOption[],
} as const;

export function getModelById(id: string): ModelOption {
  return config.models.find((m) => m.id === id) ?? config.models[0];
}
