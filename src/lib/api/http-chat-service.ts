import { config } from "@/lib/config";
import { readSSEStream } from "./sse";
import type { ChatService, SendMessageParams, StreamCallbacks } from "./types";

/**
 * Tashqi NestJS backend (lyra-api) bilan ishlovchi servis.
 * POST {apiUrl}/chat → SSE oqim qaytaradi:
 *   data: {"delta":"..."}\n\n
 *   data: {"done":true}\n\n
 *   data: {"error":"..."}\n\n
 *
 * config.chatMode="backend" bo'lganda (NEXT_PUBLIC_API_URL sozlangan)
 * shu servis ishga tushadi. Kontrakt RouteChatService bilan bir xil —
 * butun suhbat tarixi yuboriladi (backend stateless, kontekst yo'qolmaydi).
 */
export class HttpChatService implements ChatService {
  async streamMessage(
    params: SendMessageParams,
    cb: StreamCallbacks,
  ): Promise<void> {
    try {
      const res = await fetch(`${config.apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // httpOnly JWT cookie bilan himoyalangan
        body: JSON.stringify({
          model: params.model,
          conversationId: params.conversationId,
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
