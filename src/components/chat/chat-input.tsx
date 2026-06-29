"use client";

import {
  ArrowUp,
  Camera,
  FileText,
  ImagePlus,
  Plus,
  Square,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, uid } from "@/lib/utils";
import type { Attachment } from "@/types/chat";
import { ModelSelector } from "./model-selector";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPT = "image/*,application/pdf";

function isSupported(type: string) {
  return type.startsWith("image/") || type === "application/pdf";
}

/** File'ni Attachment'ga (base64) o'qiydi. */
function readFile(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({
        id: uid("att_"),
        name: file.name,
        mimeType: file.type,
        data: base64,
        dataUrl,
        size: file.size,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
}: {
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Textarea balandligini matnga moslaymiz
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileError(null);
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (!isSupported(file.type)) {
        setFileError(t("chat.unsupportedFile"));
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError(t("chat.fileTooLarge"));
        continue;
      }
      try {
        next.push(await readFile(file));
      } catch {
        /* o'qib bo'lmadi — o'tkazib yuboramiz */
      }
    }
    if (next.length) setAttachments((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  /** Ekran tasvirini olish (brauzer Screen Capture API orqali). */
  const takeScreenshot = async () => {
    setFileError(null);
    const media = navigator.mediaDevices;
    if (!media?.getDisplayMedia) {
      setFileError(t("chat.screenshotFailed"));
      return;
    }
    let stream: MediaStream | null = null;
    try {
      stream = await media.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      // Birinchi kadr tayyor bo'lishini kutamiz
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1] ?? "";
      setAttachments((prev) => [
        ...prev,
        {
          id: uid("att_"),
          name: `screenshot-${Date.now()}.png`,
          mimeType: "image/png",
          data: base64,
          dataUrl,
          size: Math.round((base64.length * 3) / 4),
        },
      ]);
    } catch {
      // Foydalanuvchi bekor qilgan bo'lishi mumkin — jimgina o'tkazamiz
    } finally {
      stream?.getTracks().forEach((tr) => tr.stop());
    }
  };

  const canSend = (value.trim() || attachments.length > 0) && !isStreaming;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim(), attachments.length ? attachments : undefined);
    setValue("");
    setAttachments([]);
    setFileError(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 md:px-6">
      <div className="rounded-[1.75rem] border border-line bg-surface p-2 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition focus-within:border-line-strong focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* Biriktirilgan fayllar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1.5 pb-1.5 pt-1">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group relative flex items-center gap-2 rounded-xl border border-line bg-elevated py-1.5 pl-1.5 pr-2"
              >
                {a.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.dataUrl}
                    alt={a.name}
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <FileText size={17} />
                  </span>
                )}
                <span className="max-w-36 truncate text-xs text-ink-soft">
                  {a.name}
                </span>
                <button
                  onClick={() => removeAttachment(a.id)}
                  aria-label={t("common.close")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-canvas opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("chat.inputPlaceholder")}
          className="block max-h-60 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[15px] leading-7 text-ink outline-none placeholder:text-muted"
        />

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t("chat.attach")}
                  title={t("chat.attach")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-elevated data-[state=open]:bg-elevated"
                >
                  <Plus size={19} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-60">
                <DropdownMenuItem
                  className="items-center"
                  onSelect={() => fileRef.current?.click()}
                >
                  <ImagePlus size={17} className="text-ink-soft" />
                  {t("chat.addFiles")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="items-center"
                  onSelect={takeScreenshot}
                >
                  <Camera size={17} className="text-ink-soft" />
                  {t("chat.takeScreenshot")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModelSelector />
          </div>

          {isStreaming ? (
            <button
              onClick={onStop}
              aria-label={t("chat.stop")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas transition hover:opacity-80"
            >
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canSend}
              aria-label={t("chat.send")}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition",
                canSend
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "cursor-not-allowed bg-line text-muted",
              )}
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>

      {fileError ? (
        <p className="mt-2 text-center text-xs text-accent">{fileError}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted">
          {t("chat.disclaimer")}
        </p>
      )}
    </div>
  );
}
