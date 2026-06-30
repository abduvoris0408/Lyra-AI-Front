import { config } from "@/lib/config";
import { BackendAuthService } from "./backend-auth-service";
import { DemoAuthService } from "./demo-auth-service";
import { GoogleAuthService } from "./google-auth-service";
import type { AuthService } from "./types";

let instance: AuthService | null = null;

/**
 * Auth servisini config asosida tanlaydi:
 *   backend + googleClientId → BackendAuthService (server JWT sessiya)
 *   googleClientId           → GoogleAuthService  (mijoz-only, backendsiz)
 *   aks holda                → DemoAuthService    (sinov)
 */
export function getAuthService(): AuthService {
  if (!instance) {
    if (config.chatMode === "backend" && config.googleClientId) {
      instance = new BackendAuthService();
    } else if (config.googleClientId) {
      instance = new GoogleAuthService();
    } else {
      instance = new DemoAuthService();
    }
  }
  return instance;
}

/** Real Google kirish faolmi (UI matnlari uchun). */
export const isGoogleAuthEnabled = Boolean(config.googleClientId);

/** Kirish skriptlarini oldindan yuklash (login sahifasi mount'ida chaqiriladi). */
export function preloadAuth(): void {
  getAuthService().preload?.();
}

export type { AuthService, AuthUser } from "./types";
