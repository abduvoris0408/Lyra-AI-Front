import type { Message } from "@/types/chat";

export interface StreamCallbacks {
  /** Har bir yangi matn bo'lagi kelganda. */
  onDelta: (text: string) => void;
  /** Oqim muvaffaqiyatli tugaganda — to'liq matn. */
  onDone: (fullText: string) => void;
  /** Xatolik yuz berganda. */
  onError: (error: Error) => void;
}

export interface SendMessageParams {
  conversationId: string;
  model: string;
  /** Suhbat tarixi — yangi user xabari ham shu ro'yxatda oxirgi bo'ladi. */
  messages: Message[];
  signal?: AbortSignal;
}

/**
 * Chat backend abstraksiyasi.
 * Mock va real (HTTP/SSE) implementatsiyalar shu interfeysga amal qiladi,
 * shuning uchun UI o'zgarmasdan backendga ulanadi.
 */
export interface ChatService {
  streamMessage(params: SendMessageParams, cb: StreamCallbacks): Promise<void>;
}
