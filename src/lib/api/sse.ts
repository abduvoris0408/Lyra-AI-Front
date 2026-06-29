import type { StreamCallbacks } from "./types";

/**
 * SSE javob oqimini o'qiydi va StreamCallbacks'ni chaqiradi.
 * Kutilgan format:
 *   data: {"delta":"..."}\n\n
 *   data: {"done":true}\n\n
 *   data: {"error":"..."}\n\n
 *
 * Route va HTTP servislari uchun umumiy — kod takrorlanmasligi uchun.
 */
export async function readSSEStream(
  res: Response,
  cb: StreamCallbacks,
): Promise<void> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.split(/\r?\n/).find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      let data: { delta?: string; done?: boolean; error?: string };
      try {
        data = JSON.parse(payload);
      } catch {
        continue; // JSON bo'lmagan bo'laklarni o'tkazib yuboramiz
      }

      if (data.error) throw new Error(data.error);
      if (data.delta) {
        full += data.delta;
        cb.onDelta(data.delta);
      }
      if (data.done) {
        cb.onDone(full);
        return;
      }
    }
  }
  cb.onDone(full);
}
