export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

/**
 * Autentifikatsiya abstraksiyasi.
 * Hozir: Google (GIS) yoki demo. Keyin: NestJS backend (JWT) — UI o'zgarmaydi.
 */
export interface AuthService {
  /** Tanlangan provayder orqali kirish. Foydalanuvchini qaytaradi. */
  signInWithGoogle(): Promise<AuthUser>;
  /** Chiqish (server sessiyasi bo'lsa, uni ham tozalaydi). */
  signOut(): Promise<void>;
}
