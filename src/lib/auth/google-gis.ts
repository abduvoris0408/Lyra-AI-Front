import { config } from "@/lib/config";

/**
 * Google Identity Services (GIS) bilan ishlash uchun umumiy yordamchi.
 * Ham mijoz-only (GoogleAuthService), ham backend (BackendAuthService)
 * shu yerdan access token oladi — kod takrorlanmaydi.
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

/** GIS skriptini bir marta yuklaydi (iOS Safari popup gesture'i uchun preload). */
export function loadGis(): Promise<void> {
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

/** Popup orqali Google OAuth access token oladi. */
export async function getGoogleAccessToken(): Promise<string> {
  await loadGis();
  const google = (window as unknown as { google: GoogleGsi }).google;

  return new Promise<string>((resolve, reject) => {
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
}
