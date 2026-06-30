import { getGoogleAccessToken, loadGis } from "./google-gis";
import type { AuthService, AuthUser } from "./types";

/**
 * Mijoz-only Google kirish (backendsiz rejim).
 * GIS popup → access token → userinfo (mijozda). Sessiya faqat brauzerda.
 *
 * Backend mavjud bo'lsa BackendAuthService ishlatiladi — u tokenni serverda
 * tekshiradi va JWT sessiya yaratadi.
 */
export class GoogleAuthService implements AuthService {
  /** Skriptni oldindan yuklaymiz (iOS Safari popup gesture'i uzilmasligi uchun). */
  preload(): void {
    loadGis().catch(() => {});
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const accessToken = await getGoogleAccessToken();

    const info = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((r) => {
      if (!r.ok) throw new Error("Foydalanuvchi ma'lumotini olib bo'lmadi");
      return r.json() as Promise<{
        sub: string;
        name?: string;
        email?: string;
        picture?: string;
      }>;
    });

    return {
      id: info.sub,
      name: info.name ?? info.email ?? "Foydalanuvchi",
      email: info.email ?? "",
      picture: info.picture,
    };
  }

  async signOut(): Promise<void> {
    // GIS access token'lari qisqa umrli; mahalliy sessiyani tozalash kifoya.
  }
}
