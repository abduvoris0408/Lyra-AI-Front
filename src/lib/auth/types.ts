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
  /**
   * (Ixtiyoriy) Joriy sessiyani server cookie'sidan tiklaydi.
   * Backend rejimida ilova ochilganda chaqiriladi: httpOnly JWT mavjud bo'lsa
   * foydalanuvchini qaytaradi, aks holda null.
   */
  getSession?(): Promise<AuthUser | null>;
  /**
   * (Ixtiyoriy) Kirish skriptlarini oldindan yuklash. Safari/iOS popup'ni
   * faqat foydalanuvchi tegintirgan zahoti (sync) ochishga ruxsat beradi,
   * shuning uchun skriptni oldindan tayyorlab qo'yamiz.
   */
  preload?(): void;
}
