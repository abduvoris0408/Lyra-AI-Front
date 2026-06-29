"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

export function ConversationItem({
  conversation,
  active,
  onSelect,
  onDelete,
  onRename,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(conversation.title);
    setEditing(true);
  };

  const save = () => {
    const title = value.trim();
    if (title) onRename(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-elevated px-2 py-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-ink outline-none"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            save();
          }}
          aria-label={t("common.save")}
          className="shrink-0 rounded p-1 text-muted transition hover:text-accent"
        >
          <Check size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditing(false);
          }}
          aria-label={t("common.cancel")}
          className="shrink-0 rounded p-1 text-muted transition hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm transition",
        active ? "bg-accent-soft text-ink" : "text-ink-soft hover:bg-elevated",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
      <button
        onClick={startEdit}
        aria-label={t("common.rename")}
        className="shrink-0 rounded p-1 text-muted opacity-0 transition hover:text-ink group-hover:opacity-100"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={t("common.delete")}
        className="shrink-0 rounded p-1 text-muted opacity-0 transition hover:text-accent group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
