import type { NextRequest } from "next/server";

/**
 * Gemini'ga server tomonda ulanadigan SSE proksi.
 *
 * MUHIM: GEMINI_API_KEY faqat shu yerda (serverda) o'qiladi — brauzerga
 * hech qachon chiqmaydi. Frontend faqat shu route bilan gaplashadi.
 *
 * Chiqish formati (HttpChatService/RouteChatService bilan bir xil):
 *   data: {"delta":"..."}\n\n
 *   data: {"done":true}\n\n
 *   data: {"error":"..."}\n\n
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_BASE =
  process.env.GEMINI_API_URL ??
  "https://generativelanguage.googleapis.com/v1beta";

interface IncomingAttachment {
  mimeType: string;
  data: string;
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: IncomingAttachment[];
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function errorStream(message: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(sse({ error: message })));
      controller.enqueue(enc.encode(sse({ done: true })));
      controller.close();
    },
  });
  return new Response(stream, { headers: sseHeaders() });
}

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorStream(
      "GEMINI_API_KEY sozlanmagan. lyra-web/.env.local fayliga kalitni qo'shing.",
    );
  }

  let body: { messages?: IncomingMessage[]; model?: string; system?: string };
  try {
    body = await req.json();
  } catch {
    return errorStream("So'rov formati noto'g'ri.");
  }

  const model = body.model || "gemini-flash-latest";
  const contents = (body.messages ?? [])
    .filter((m) => m.content?.trim() || (m.attachments?.length ?? 0) > 0)
    .map((m) => {
      const parts: GeminiPart[] = [];
      if (m.content?.trim()) parts.push({ text: m.content });
      for (const a of m.attachments ?? []) {
        if (a.data && a.mimeType) {
          parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
        }
      }
      return { role: m.role === "assistant" ? "model" : "user", parts };
    });

  if (contents.length === 0) {
    return errorStream("Yuborish uchun xabar yo'q.");
  }

  const upstream = await fetch(
    `${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(body.system
          ? { systemInstruction: { parts: [{ text: body.system }] } }
          : {}),
      }),
      signal: req.signal,
    },
  ).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await safeText(upstream) : "ulanib bo'lmadi";
    return errorStream(
      `Gemini xatosi${upstream ? ` (${upstream.status})` : ""}: ${detail}`,
    );
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += dec.decode(value, { stream: true });
          // Gemini CRLF (\r\n\r\n) ishlatadi — \n\n va \r\n\r\n ikkalasini ham qo'llab-quvvatlaymiz
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const event of events) {
            const line = event
              .split(/\r?\n/)
              .find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            const text = extractText(payload);
            if (text) controller.enqueue(enc.encode(sse({ delta: text })));
          }
        }
        controller.enqueue(enc.encode(sse({ done: true })));
      } catch (err) {
        controller.enqueue(
          enc.encode(
            sse({ error: (err as Error)?.message ?? "Oqim uzildi" }),
          ),
        );
        controller.enqueue(enc.encode(sse({ done: true })));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

/** Gemini chunk'idan matnni ajratib oladi. */
function extractText(payload: string): string {
  try {
    const data = JSON.parse(payload) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p) => p.text ?? "").join("");
  } catch {
    return "";
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 300);
  } catch {
    return "noma'lum xato";
  }
}
