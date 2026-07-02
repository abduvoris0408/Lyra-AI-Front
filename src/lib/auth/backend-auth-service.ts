import { config } from "@/lib/config";
import { getGoogleAccessToken, loadGis } from "./google-gis";
import type { AuthService, AuthUser } from "./types";

/**
 * NestJS backend (lyra-api) orqali real autentifikatsiya.
 *
 * Oqim:
 *   1. GIS popup → Google access token (mijozda).
 *   2. POST {apiUrl}/auth/google { accessToken } — server token'ni TEKSHIRADI,
 *      foydalanuvchini yaratadi/yangilaydi va httpOnly JWT cookie o'rnatadi.
 *   3. Keyingi so'rovlar (chat, conversations) cookie bilan avtomatik himoyalanadi.
 *
 * Sirlar va sessiya serverda — brauzerda token saqlanmaydi.
 *
 * MUHIM: metodlar arrow-function klass maydonlari sifatida yozilgan
 * (oddiy metod emas), chunki chaqiruvchi tomonlar (masalan RequireAuth)
 * `getAuthService().getSession` kabi metodni obyektdan ajratib olib,
 * keyin alohida chaqiradi — oddiy metodda bunda `this` yo'qolib,
 * `this.toUser` chaqirilganda "Cannot read properties of undefined" xatosi
 * berardi.
 */
export class BackendAuthService implements AuthService {
  preload = (): void => {
    loadGis().catch(() => {});
  };

  signInWithGoogle = async (): Promise<AuthUser> => {
    const accessToken = await getGoogleAccessToken();

    const res = await fetch(`${config.apiUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accessToken }),
    });
    if (!res.ok) {
      throw new Error("Server kirishni rad etdi. Qayta urinib ko'ring.");
    }
    return this.toUser(await res.json());
  };

  getSession = async (): Promise<AuthUser | null> => {
    try {
      // cache: "no-store" — 304 (Not Modified) keshini oldini olamiz, aks holda
      // res.ok=false bo'lib sessiya yo'qdek ko'rinadi.
      const res = await fetch(`${config.apiUrl}/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) return this.toUser(await res.json());

      // Access token muddati tugagan bo'lishi mumkin — refresh'ni sinab ko'ramiz.
      if (res.status === 401) {
        const refreshed = await fetch(`${config.apiUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        if (refreshed.ok) return this.toUser(await refreshed.json());
      }
      return null;
    } catch {
      return null;
    }
  };

  signOut = async (): Promise<void> => {
    await fetch(`${config.apiUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  };

  private toUser(raw: unknown): AuthUser {
    const u = raw as {
      id: string;
      name?: string;
      email?: string;
      picture?: string;
    };
    return {
      id: u.id,
      name: u.name ?? u.email ?? "Foydalanuvchi",
      email: u.email ?? "",
      picture: u.picture,
    };
  }
}
