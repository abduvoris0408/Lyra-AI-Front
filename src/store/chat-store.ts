import { create } from "zustand";
import { persist } from "zustand/middleware";
import { conversationsApi, syncEnabled } from "@/lib/api/conversations";
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
  /**
   * Yangi suhbat boshlaydi. Backend rejimida serverda yaratib, server id'sini
   * ishlatadi (chat oqimi shu id bilan saqlanadi). Lokal rejimda — newConversation.
   */
  createConversation: () => Promise<string>;
  /** Backend rejimida foydalanuvchining suhbatlarini serverdan yuklaydi. */
  loadConversations: () => Promise<void>;
  /** Suhbat xabarlarini serverdan yuklaydi (hali yuklanmagan bo'lsa). */
  loadMessages: (id: string) => Promise<void>;
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
  /** Xabar matnini to'liq almashtiradi (user xabarini tahrirlash uchun). */
  updateMessageContent: (
    conversationId: string,
    messageId: string,
    content: string,
  ) => void;
  /** Berilgan xabardan keyingi barcha xabarlarni o'chiradi (tahrirdan keyin). */
  truncateAfter: (conversationId: string, messageId: string) => void;
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

      createConversation: async () => {
        if (!syncEnabled) return get().newConversation();
        try {
          const conv = await conversationsApi.create(get().selectedModel);
          set((s) => ({
            conversations: [conv, ...s.conversations],
            messagesByConversation: {
              ...s.messagesByConversation,
              [conv.id]: [],
            },
            currentId: conv.id,
          }));
          return conv.id;
        } catch {
          // Server xato bersa — lokal suhbat bilan davom etamiz (oqim baribir ishlaydi)
          return get().newConversation();
        }
      },

      loadConversations: async () => {
        if (!syncEnabled) return;
        try {
          const list = await conversationsApi.list();
          set((s) => ({
            conversations: list,
            // Joriy suhbat ro'yxatda bo'lmasa, tanlovni tozalaymiz
            currentId:
              s.currentId && list.some((c) => c.id === s.currentId)
                ? s.currentId
                : null,
          }));
        } catch {
          /* offline — keshdagi (persist) suhbatlar ko'rsatiladi */
        }
      },

      loadMessages: async (id) => {
        if (!syncEnabled) return;
        // Allaqachon yuklangan bo'lsa qayta tortmaymiz
        if (get().messagesByConversation[id] !== undefined) return;
        try {
          const messages = await conversationsApi.getMessages(id);
          set((s) => ({
            messagesByConversation: {
              ...s.messagesByConversation,
              [id]: messages,
            },
          }));
        } catch {
          /* e'tiborsiz */
        }
      },

      selectConversation: (id) => {
        set({ currentId: id });
        // Backend rejimida xabarlarni dangasa (lazy) yuklaymiz
        if (syncEnabled) void get().loadMessages(id);
      },

      deleteConversation: (id) => {
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
        });
        if (syncEnabled) void conversationsApi.remove(id).catch(() => {});
      },

      renameConversation: (id, title) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: nowISO() } : c,
          ),
        }));
        if (syncEnabled)
          void conversationsApi.rename(id, title).catch(() => {});
      },

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

      updateMessageContent: (conversationId, messageId, content) =>
        set((s) => ({
          messagesByConversation: {
            ...s.messagesByConversation,
            [conversationId]: (
              s.messagesByConversation[conversationId] ?? []
            ).map((m) => (m.id === messageId ? { ...m, content } : m)),
          },
        })),

      truncateAfter: (conversationId, messageId) =>
        set((s) => {
          const list = s.messagesByConversation[conversationId] ?? [];
          const idx = list.findIndex((m) => m.id === messageId);
          if (idx === -1) return {};
          return {
            messagesByConversation: {
              ...s.messagesByConversation,
              [conversationId]: list.slice(0, idx + 1),
            },
          };
        }),

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
