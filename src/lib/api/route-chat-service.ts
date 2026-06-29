import { readSSEStream } from "./sse";
import type { ChatService, SendMessageParams, StreamCallbacks } from "./types";

/**
 * Next.js server route (/api/chat) orqali Gemini'ga ulanadigan servis.
 * Kalit serverda qoladi; bu yerda faqat o'z domenimizga so'rov ketadi.
 */
export class RouteChatService implements ChatService {
  async streamMessage(
    params: SendMessageParams,
    cb: StreamCallbacks,
  ): Promise<void> {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map((a) => ({
              mimeType: a.mimeType,
              data: a.data,
            })),
          })),
        }),
        signal: params.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server xatosi: ${res.status}`);
      }

      await readSSEStream(res, cb);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      cb.onError(err as Error);
    }
  }
}
