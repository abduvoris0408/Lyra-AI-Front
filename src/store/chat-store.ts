import { create } from "zustand";
import { persist } from "zustand/middleware";
import { config } from "@/lib/config";
import { deriveTitle, nowISO, uid } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  currentId: string | null;
  selectedModel: string;
  isStreaming: boolean;

  // --- Selektorlar ---
  currentMessages: () => Message[];
  currentConversation: () => Conversation | null;

  // --- Amallar ---
  setModel: (model: string) => void;
  newConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  addMessage: (conversationId: string, message: Message) => void;
  appendToMessage: (
    conversationId: string,
    messageId: string,
    delta: string,
  ) => void;
  setMessageStatus: (
    conversationId: string,
    messageId: string,
    status: Message["status"],
  ) => void;
  /** Xabar matnini tozalab, qayta oqim uchun tayyorlaydi (regenerate). */
  resetMessage: (conversationId: string, messageId: string) => void;
  setStreaming: (value: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messagesByConversation: {},
      currentId: null,
      selectedModel: config.defaultModelId,
      isStreaming: false,

      currentMessages: () => {
        const id = get().currentId;
        return id ? (get().messagesByConversation[id] ?? []) : [];
      },

      currentConversation: () => {
        const id = get().currentId;
        return get().conversations.find((c) => c.id === id) ?? null;
      },

      setModel: (model) => set({ selectedModel: model }),

      newConversation: () => {
        const id = uid("conv_");
        const conv: Conversation = {
          id,
          title: "Yangi suhbat",
          model: get().selectedModel,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          messagesByConversation: { ...s.messagesByConversation, [id]: [] },
          currentId: id,
        }));
        return id;
      },

      selectConversation: (id) => set({ currentId: id }),

      deleteConversation: (id) =>
        set((s) => {
          const rest = { ...s.messagesByConversation };
          delete rest[id];
          const conversations = s.conversations.filter((c) => c.id !== id);
          return {
            conversations,
            messagesByConversation: rest,
            currentId:
              s.currentId === id ? (conversations[0]?.id ?? null) : s.currentId,
          };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: nowISO() } : c,
          ),
        })),

      addMessage: (conversationId, message) =>
        set((s) => {
          const list = s.messagesByConversation[conversationId] ?? [];
          const isFirstUserMsg =
            message.role === "user" &&
            !list.some((m) => m.role === "user");
          return {
            messagesByConversation: {
              ...s.messagesByConversation,
              [conversationId]: [...list, message],
            },
            conversations: s.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    updatedAt: nowISO(),
                    title: isFirstUserMsg
                      ? deriveTitle(message.content)
                      : c.title,
                  }
                : c,
            ),
          };
        }),

      appendToMessage: (conversationId, messageId, delta) =>
        set((s) => ({
          messagesByConversation: {
            ...s.messagesByConversation,
            [conversationId]: (
              s.messagesByConversation[conversationId] ?? []
            ).map((m) =>
              m.id === messageId ? { ...m, content: m.content + delta } : m,
            ),
          },
        })),

      setMessageStatus: (conversationId, messageId, status) =>
        set((s) => ({
          messagesByConversation: {
            ...s.messagesByConversation,
            [conversationId]: (
              s.messagesByConversation[conversationId] ?? []
            ).map((m) => (m.id === messageId ? { ...m, status } : m)),
          },
        })),

      resetMessage: (conversationId, messageId) =>
        set((s) => ({
          messagesByConversation: {
            ...s.messagesByConversation,
            [conversationId]: (
              s.messagesByConversation[conversationId] ?? []
            ).map((m) =>
              m.id === messageId
                ? { ...m, content: "", status: "streaming" }
                : m,
            ),
          },
        })),

      setStreaming: (value) => set({ isStreaming: value }),
    }),
    {
      name: "lyra-chat",
      partialize: (s) => ({
        conversations: s.conversations,
        messagesByConversation: s.messagesByConversation,
        currentId: s.currentId,
        selectedModel: s.selectedModel,
      }),
    },
  ),
);
