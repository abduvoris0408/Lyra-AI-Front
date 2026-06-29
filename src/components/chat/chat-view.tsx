"use client";

import { PanelLeft } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat-store";
import type { Message } from "@/types/chat";
import { ChatInput } from "./chat-input";
import { Greeting } from "./greeting";
import { MessageList } from "./message-list";
import { SuggestionChips } from "./suggestion-chips";

/** Barqaror bo'sh massiv — har renderda yangi reference yaratilmasligi uchun. */
const EMPTY: Message[] = [];

export function ChatView({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { send, stop, regenerate, isStreaming } = useChat();
  const messages = useChatStore((s) =>
    s.currentId ? (s.messagesByConversation[s.currentId] ?? EMPTY) : EMPTY,
  );
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 px-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Panelni ochish/yopish"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-elevated md:hidden"
        >
          <PanelLeft size={19} />
        </button>
        <span className="font-serif text-lg font-medium text-ink">Lyra</span>
      </header>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
          <div className="w-full max-w-3xl">
            <Greeting />
            <div className="mt-8">
              <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
            </div>
            <div className="mt-3">
              <SuggestionChips onPick={send} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onRegenerate={regenerate}
          />
          <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
        </>
      )}
    </div>
  );
}
