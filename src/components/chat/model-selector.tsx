"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownCheck,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { config, getModelById } from "@/lib/config";
import { useChatStore } from "@/store/chat-store";

export function ModelSelector() {
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setModel = useChatStore((s) => s.setModel);
  const current = getModelById(selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-ink-soft outline-none transition hover:bg-elevated data-[state=open]:bg-elevated">
        {current.label}
        <ChevronDown
          size={15}
          className="transition group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-72">
        {config.models.map((m) => (
          <DropdownMenuItem key={m.id} onSelect={() => setModel(m.id)}>
            <DropdownCheck active={m.id === selectedModel} />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                {m.label}
              </span>
              <span className="block text-xs text-muted">{m.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
