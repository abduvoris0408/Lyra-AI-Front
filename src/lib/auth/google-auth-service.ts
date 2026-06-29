import { config } from "@/lib/config";
import type { AuthService, AuthUser } from "./types";

/**
 * Google Identity Services (GIS) orqali real kirish.
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID kerak. ID token emas, OAuth access token oqimi
 * ishlatiladi: popup → access_token → userinfo.
 *
 * Eslatma: hozir token tekshiruvi mijoz tomonda. NestJS tayyor bo'lganda
 * token backendga yuborilib, u yerda tekshiriladi va JWT sessiya yaratiladi.
 */
interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleGsi {
  accounts: {
    oauth2: {
      initTokenClient(opts: {
        client_id: string;
        scope: string;
        callback: (resp: TokenResponse) => void;
        error_callback?: (err: { type?: string }) => void;
      }): { requestAccessToken: () => void };
    };
  };
}

let scriptPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if ((window as unknown as { google?: GoogleGsi }).google) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google skriptini yuklab bo'lmadi"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export class GoogleAuthService implements AuthService {
  async signInWithGoogle(): Promise<AuthUser> {
    await loadGis();
    const google = (window as unknown as { google: GoogleGsi }).google;

    const accessToken = await new Promise<string>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: config.googleClientId,
        scope: "openid email profile",
        callback: (resp) => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error ?? "Kirish bekor qilindi"));
          } else {
            resolve(resp.access_token);
          }
        },
        error_callback: (err) =>
          reject(new Error(err.type ?? "Kirish bekor qilindi")),
      });
      client.requestAccessToken();
    });

    const info = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ).then((r) => {
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
