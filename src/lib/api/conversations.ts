import { config } from "@/lib/config";
import type { Conversation, Message } from "@/types/chat";

/**
 * Backend (lyra-api) suhbatlar API'si.
 * Faqat backend rejimida ishlatiladi — barcha so'rovlar httpOnly JWT cookie
 * bilan himoyalangan (credentials: "include").
 */

interface ServerConversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function toConversation(c: ServerConversation): Conversation {
  return {
    id: c.id,
    title: c.title,
    model: c.model,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function toMessage(m: ServerMessage): Message {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
    status: m.role === "assistant" ? "done" : undefined,
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiUrl}${path}`, {
    credentials: "include",
    cache: "no-store", // 304 keshini oldini olamiz (res.ok=false bo'lib qolmasin)
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const conversationsApi = {
  async list(): Promise<Conversation[]> {
    const data = await api<ServerConversation[]>("/conversations");
    return data.map(toConversation);
  },

  async create(model?: string): Promise<Conversation> {
    const data = await api<ServerConversation>("/conversations", {
      method: "POST",
      body: JSON.stringify(model ? { model } : {}),
    });
    return toConversation(data);
  },

  async getMessages(id: string): Promise<Message[]> {
    const data = await api<ServerConversation & { messages: ServerMessage[] }>(
      `/conversations/${id}`,
    );
    return (data.messages ?? []).map(toMessage);
  },

  async rename(id: string, title: string): Promise<void> {
    await api(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  async remove(id: string): Promise<void> {
    await api(`/conversations/${id}`, { method: "DELETE" });
  },
};

/** Backend bilan sinxronlash yoqilganmi (config orqali). */
export const syncEnabled = config.chatMode === "backend";
