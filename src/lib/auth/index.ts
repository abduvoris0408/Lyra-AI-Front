import { config } from "@/lib/config";
import { DemoAuthService } from "./demo-auth-service";
import { GoogleAuthService } from "./google-auth-service";
import type { AuthService } from "./types";

let instance: AuthService | null = null;

/** Google client ID bo'lsa real, bo'lmasa demo servis. */
export function getAuthService(): AuthService {
  if (!instance) {
    instance = config.googleClientId
      ? new GoogleAuthService()
      : new DemoAuthService();
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
