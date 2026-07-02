"use client";

import {
  Check,
  Copy,
  FileText,
  Maximize2,
  Pencil,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { previewImage } from "@/store/image-preview-store";
import { toast } from "@/store/toast-store";
import type { Message } from "@/types/chat";
import { Markdown } from "./markdown";

export function MessageItem({
  message,
  staggerIndex,
  onRegenerate,
  onEdit,
}: {
  message: Message;
  staggerIndex?: number;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
}) {
  const delayStyle =
    staggerIndex !== undefined
      ? ({ "--lyra-delay": `${staggerIndex * 45}ms` } as React.CSSProperties)
      : undefined;

  if (message.role === "user") {
    return <UserMessage message={message} onEdit={onEdit} style={delayStyle} />;
  }
  return (
    <AssistantMessage
      message={message}
      onRegenerate={onRegenerate}
      style={delayStyle}
    />
  );
}

/** Xabar tagidagi kichik amal tugmasi (copy / edit / share / regenerate). */
function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-elevated hover:text-ink active:scale-95"
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function useCopied() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast(t("chat.toastCopied"), "success");
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

function UserMessage({
  message,
  onEdit,
  style,
}: {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  style?: React.CSSProperties;
}) {
  const { t } = useI18n();
  const { copied, copy } = useCopied();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(message.content);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const attachments = message.attachments ?? [];

  useEffect(() => {
    if (editing) {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [editing]);

  const saveEdit = () => {
    const next = value.trim();
    if (next && next !== message.content) onEdit?.(message.id, next);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="lyra-fade-up flex flex-col items-end gap-2" style={style}>
        <div className="w-full max-w-[85%] rounded-bubble bg-user-bubble p-3">
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
              }
              if (e.key === "Escape") {
                setValue(message.content);
                setEditing(false);
              }
            }}
            className="max-h-60 w-full resize-none bg-transparent text-[15px] leading-7 text-ink outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setValue(message.content);
                setEditing(false);
              }}
              className="rounded-md px-3 py-1.5 text-xs text-muted transition hover:bg-elevated hover:text-ink"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={saveEdit}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
            >
              {t("chat.send")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lyra-fade-up group flex flex-col items-end gap-1.5" style={style}>
      {attachments.length > 0 && (
        <div className="flex max-w-[78%] flex-wrap justify-end gap-2">
          {attachments.map((a) =>
            a.mimeType.startsWith("image/") ? (
              <button
                key={a.id}
                type="button"
                onClick={() => previewImage(a.dataUrl, a.name)}
                className="group/img relative overflow-hidden rounded-2xl border border-line transition hover:opacity-95"
                aria-label={a.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  className="max-h-48 object-cover"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition group-hover/img:bg-black/25 group-hover/img:text-white">
                  <Maximize2 size={20} />
                </span>
              </button>
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

      {message.content && (
        <div className="flex items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <ActionButton
            icon={copied ? Check : Copy}
            label={copied ? t("chat.copied") : t("chat.copy")}
            onClick={() => copy(message.content)}
          />
          {onEdit && (
            <ActionButton
              icon={Pencil}
              label={t("chat.edit")}
              onClick={() => {
                setValue(message.content);
                setEditing(true);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AssistantMessage({
  message,
  onRegenerate,
  style,
}: {
  message: Message;
  onRegenerate?: () => void;
  style?: React.CSSProperties;
}) {
  const { t } = useI18n();
  const { copied, copy } = useCopied();
  const isStreaming = message.status === "streaming";
  const isEmpty = message.content.length === 0;

  return (
    <div className="lyra-fade-up group flex gap-3.5" style={style} id={message.id}>
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_10px_-2px_var(--color-accent)] transition-shadow",
          isStreaming && "animate-pulse shadow-[0_0_0_4px_var(--color-accent-soft)]",
        )}
      >
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
          <div className="mt-2 flex items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            <ActionButton
              icon={copied ? Check : Copy}
              label={copied ? t("chat.copied") : t("chat.copy")}
              onClick={() => copy(message.content)}
            />
            <ActionButton
              icon={Share2}
              label={t("chat.share")}
              onClick={() => shareLink(message.id, t("chat.toastLinkCopied"))}
            />
            {onRegenerate && (
              <ActionButton
                icon={RefreshCw}
                label={t("chat.regenerate")}
                onClick={onRegenerate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Xabarga havolani ulashadi. Mobil qurilmalarda tizim "Share" oynasini ochadi
 * (navigator.share), aks holda havolani clipboard'ga nusxalaydi. Havola joriy
 * sahifaga + xabar id'siga (#anchor) ishora qiladi.
 *
 * MUHIM: navigator.share() faqat sensorli (mobil) qurilmalarda chaqiriladi —
 * Windows desktop'da u ko'pincha o'zining "Try that again" xatosini beradi.
 */
async function shareLink(messageId: string, copiedLabel: string) {
  const url = `${window.location.origin}${window.location.pathname}#${messageId}`;
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;
  const nav = navigator as Navigator & {
    share?: (data: { url: string; title?: string }) => Promise<void>;
  };
  if (isTouch && nav.share) {
    try {
      await nav.share({ url, title: "Lyra AI" });
      return;
    } catch {
      // foydalanuvchi bekor qildi yoki qo'llab-quvvatlanmaydi — nusxaga o'tamiz
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast(copiedLabel, "success");
  } catch {
    /* clipboard mavjud emas — e'tiborsiz */
  }
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
