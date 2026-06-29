export type Role = "user" | "assistant";

export type MessageStatus = "streaming" | "done" | "error";

/** Foydalanuvchi biriktirgan fayl (rasm yoki PDF). */
export interface Attachment {
  id: string;
  name: string;
  /** MIME turi, masalan "image/png", "application/pdf". */
  mimeType: string;
  /** base64 (prefiksiz) — Gemini inlineData uchun. */
  data: string;
  /** Brauzerda ko'rsatish uchun to'liq data URL. */
  dataUrl: string;
  size: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  /** Faqat assistant xabarlari uchun: oqim holati. */
  status?: MessageStatus;
  /** Foydalanuvchi biriktirgan fayllar (rasm/PDF). */
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}
