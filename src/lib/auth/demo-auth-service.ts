import type { AuthService, AuthUser } from "./types";

/**
 * Google client ID sozlanmaganda ishlaydigan demo kirish.
 * Butun oqim (landing → login → onboarding → chat) sozlamasiz ham ishlasin.
 * Google ID qo'shilgach avtomatik real kirishga o'tadi.
 */
export class DemoAuthService implements AuthService {
  async signInWithGoogle(): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      id: "demo-user",
      name: "Demo Foydalanuvchi",
      email: "demo@lyra.ai",
    };
  }

  async signOut(): Promise<void> {
    // Demoda tashqi sessiya yo'q.
  }
}
