import type { ChatService, SendMessageParams, StreamCallbacks } from "./types";

/**
 * Mock chat servisi — backend tayyor bo'lmaguncha UI to'liq ishlashi uchun.
 * Gemini'ning streaming javobini taqlid qiladi: matnni so'zma-so'z chiqaradi.
 */
export class MockChatService implements ChatService {
  async streamMessage(
    params: SendMessageParams,
    cb: StreamCallbacks,
  ): Promise<void> {
    const lastUser = [...params.messages]
      .reverse()
      .find((m) => m.role === "user");
    const prompt = lastUser?.content ?? "";

    const reply = buildReply(prompt);
    const tokens = reply.match(/\S+\s*/g) ?? [reply];

    let full = "";
    try {
      // Birinchi bo'lakdan oldin qisqa "o'ylash" pauzasi
      await delay(220, params.signal);
      for (const token of tokens) {
        if (params.signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        await delay(18 + Math.random() * 45, params.signal);
        full += token;
        cb.onDelta(token);
      }
      cb.onDone(full);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        // To'xtatilgan oqim ham hozirgacha yozilganini saqlaydi
        cb.onDone(full);
        return;
      }
      cb.onError(err as Error);
    }
  }
}

function buildReply(prompt: string): string {
  const p = prompt.trim();
  if (!p) {
    return "Salom! Men Lyra — aqlli suhbat yordamchingiz. Savolingizni yozing.";
  }
  return [
    `Siz shunday deb yozdingiz: **"${p}"**.`,
    "",
    "Hozir men *mock* (sinov) rejimida ishlayapman. ",
    "Model ulangach, shu yerda haqiqiy javoblar real vaqtda oqib chiqadi.",
    "",
    "Tekshirish uchun ro'yxat ham ko'rsata olaman:",
    "- Streaming UI ishlayapti ✅",
    "- Markdown render qilinmoqda ✅",
    "- Suhbat tarixi saqlanmoqda ✅",
    "",
    "```ts",
    "// Backend ulangach faqat shu yetarli:",
    'const service = getChatService(); // HttpChatService',
    "```",
  ].join("\n");
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
