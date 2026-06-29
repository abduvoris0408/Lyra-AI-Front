"use client";

import { Check, Copy, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { Markdown } from "./markdown";

export function MessageItem({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: () => void;
}) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }
  return <AssistantMessage message={message} onRegenerate={onRegenerate} />;
}

function UserMessage({ message }: { message: Message }) {
  const attachments = message.attachments ?? [];
  return (
    <div className="lyra-fade-up flex flex-col items-end gap-1.5">
      {attachments.length > 0 && (
        <div className="flex max-w-[78%] flex-wrap justify-end gap-2">
          {attachments.map((a) =>
            a.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.id}
                src={a.dataUrl}
                alt={a.name}
                className="max-h-48 rounded-2xl border border-line object-cover"
              />
            ) : (
              <a
                key={a.id}
                href={a.dataUrl}
                download={a.name}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition hover:bg-elevated"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <FileText size={16} />
                </span>
                <span className="max-w-40 truncate">{a.name}</span>
              </a>
            ),
          )}
        </div>
      )}
      {message.content && (
        <div className="max-w-[78%] whitespace-pre-wrap break-words rounded-bubble bg-user-bubble px-4 py-2.5 text-[15px] leading-7 text-ink">
          {message.content}
        </div>
      )}
    </div>
  );
}

function AssistantMessage({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const isStreaming = message.status === "streaming";
  const isEmpty = message.content.length === 0;

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="lyra-fade-up group flex gap-3.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <LyraMark className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        {isEmpty && isStreaming ? (
          <ThinkingDots />
        ) : (
          <div className={cn(isStreaming && "lyra-caret")}>
            <Markdown content={message.content} />
          </div>
        )}

        {!isStreaming && !isEmpty && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition hover:bg-elevated hover:text-ink"
            >
              {copied ? (
                <>
                  <Check size={13} /> {t("chat.copied")}
                </>
              ) : (
                <>
                  <Copy size={13} /> {t("chat.copy")}
                </>
              )}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition hover:bg-elevated hover:text-ink"
              >
                <RefreshCw size={13} /> {t("chat.regenerate")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex h-7 items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted"
          style={{
            animation: "lyra-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}
