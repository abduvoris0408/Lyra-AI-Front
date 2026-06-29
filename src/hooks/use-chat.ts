"use client";

import { useCallback, useRef } from "react";
import { getChatService } from "@/lib/api";
import { nowISO, uid } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import type { Attachment, Message } from "@/types/chat";

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);

  const isStreaming = useChatStore((s) => s.isStreaming);

  /** Berilgan assistant xabariga oqimni ishga tushiradi. */
  const runStream = useCallback(
    async (
      conversationId: string,
      assistantId: string,
      history: Message[],
      model: string,
    ) => {
      useChatStore.getState().setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      // Typewriter buferi — Gemini katta bo'laklarni birdan yuboradi.
      // Matnni navbatga qo'yib, bir tekis tezlikda belgi-belgi ko'rsatamiz,
      // shunda javob silliq "yozilayotgandek" chiqadi (juda tez sakramaydi).
      let pending = "";
      let finished = false;
      let streamError: Error | null = null;

      const drained = new Promise<void>((resolve) => {
        const tick = () => {
          if (pending.length > 0) {
            // So'zma-so'z ochish — bir tekis, tabiiy "yozilayotgandek" ritm.
            // Har kadrda bir nechta belgi olamiz, lekin so'z o'rtasida
            // kesmaslik uchun keyingi bo'sh joygacha cho'zamiz. Orqada ko'p
            // matn yig'ilsa, tezlikni oshiramiz (sakrab ketmaydi).
            const budget = Math.min(
              22,
              Math.max(3, Math.ceil(pending.length / 32)),
            );
            let cut = Math.min(budget, pending.length);
            while (cut < pending.length && !/\s/.test(pending[cut])) cut++;
            // bo'sh joyni ham qo'shib yuboramiz, so'z butun ko'rinadi
            while (cut < pending.length && /\s/.test(pending[cut])) cut++;
            const chunk = pending.slice(0, cut);
            pending = pending.slice(cut);
            useChatStore
              .getState()
              .appendToMessage(conversationId, assistantId, chunk);
          }
          if (pending.length === 0 && finished) {
            resolve();
            return;
          }
          setTimeout(tick, 26);
        };
        setTimeout(tick, 26);
      });

      try {
        await getChatService().streamMessage(
          {
            conversationId,
            model,
            messages: history,
            signal: controller.signal,
          },
          {
            onDelta: (delta) => {
              pending += delta;
            },
            onDone: () => {
              finished = true;
            },
            onError: (err) => {
              streamError = err;
              finished = true;
            },
          },
        );
      } finally {
        finished = true; // har qanday holatda typewriter sikli to'xtaydi
      }

      await drained; // qolgan matn to'liq ko'rsatilguncha kutamiz

      const s = useChatStore.getState();
      if (streamError) {
        const err = streamError as Error;
        const reason = err.message?.trim()
          ? err.message
          : "Javob olishda xatolik yuz berdi.";
        s.appendToMessage(conversationId, assistantId, `\n\n⚠️ ${reason}`);
        s.setMessageStatus(conversationId, assistantId, "error");
      } else {
        s.setMessageStatus(conversationId, assistantId, "done");
      }
      s.setStreaming(false);
      abortRef.current = null;
    },
    [],
  );

  const send = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      const content = text.trim();
      if (!content && (attachments?.length ?? 0) === 0) return;

      const store = useChatStore.getState();
      if (store.isStreaming) return;

      const conversationId = store.currentId ?? store.newConversation();
      const model = store.selectedModel;

      const userMsg: Message = {
        id: uid("msg_"),
        role: "user",
        content,
        createdAt: nowISO(),
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      };
      store.addMessage(conversationId, userMsg);

      const assistantMsg: Message = {
        id: uid("msg_"),
        role: "assistant",
        content: "",
        createdAt: nowISO(),
        status: "streaming",
      };
      store.addMessage(conversationId, assistantMsg);

      const history = (
        useChatStore.getState().messagesByConversation[conversationId] ?? []
      ).filter((m) => m.id !== assistantMsg.id);

      await runStream(conversationId, assistantMsg.id, history, model);
    },
    [runStream],
  );

  /** Oxirgi assistant javobini qaytadan yaratadi. */
  const regenerate = useCallback(async () => {
    const store = useChatStore.getState();
    if (store.isStreaming) return;

    const conversationId = store.currentId;
    if (!conversationId) return;

    const msgs = store.messagesByConversation[conversationId] ?? [];
    // Oxirgi assistant xabarini topamiz
    let idx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") {
        idx = i;
        break;
      }
    }
    if (idx === -1) return;

    const assistant = msgs[idx];
    const history = msgs.slice(0, idx); // assistantgacha bo'lgan tarix (user bilan tugaydi)
    if (history.length === 0) return;

    store.resetMessage(conversationId, assistant.id);
    await runStream(conversationId, assistant.id, history, store.selectedModel);
  }, [runStream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    useChatStore.getState().setStreaming(false);
  }, []);

  return { send, regenerate, stop, isStreaming };
}
