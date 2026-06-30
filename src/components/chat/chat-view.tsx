"use client";

import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat-store";
import type { Message } from "@/types/chat";
import { ChatInput } from "./chat-input";
import { Greeting } from "./greeting";
import { MessageList } from "./message-list";
import { SuggestionChips } from "./suggestion-chips";

/** Barqaror bo'sh massiv — har renderda yangi reference yaratilmasligi uchun. */
const EMPTY: Message[] = [];

export function ChatView() {
  const { send, stop, regenerate, isStreaming } = useChat();
  const messages = useChatStore((s) =>
    s.currentId ? (s.messagesByConversation[s.currentId] ?? EMPTY) : EMPTY,
  );
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
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
