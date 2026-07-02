"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import type { Message } from "@/types/chat";
import { MessageItem } from "./message-item";

export function MessageList({
  messages,
  isStreaming,
  onRegenerate,
  onEdit,
}: {
  messages: Message[];
  isStreaming: boolean;
  onRegenerate: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
}) {
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottom.current = distance < 120;
      setShowScrollBtn(distance > 240);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({
        behavior: isStreaming ? "auto" : "smooth",
      });
    }
  }, [messages, isStreaming]);

  const scrollToBottom = () => {
    stickToBottom.current = true;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Oxirgi assistant xabari — faqat shunga "qayta yaratish" beriladi
  let lastAssistantId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantId = messages[i].id;
      break;
    }
  }

  return (
    <div className="relative flex-1 overflow-y-auto" ref={containerRef}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 md:px-6">
        {messages.map((m, i) => (
          <MessageItem
            key={m.id}
            message={m}
            staggerIndex={messages.length - i <= 8 ? i : undefined}
            onRegenerate={
              !isStreaming && m.id === lastAssistantId ? onRegenerate : undefined
            }
            onEdit={!isStreaming ? onEdit : undefined}
          />
        ))}
        <div ref={bottomRef} className="h-px" />
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          aria-label={t("chat.scrollToBottom")}
          className="sticky bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-md transition hover:bg-elevated"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}
