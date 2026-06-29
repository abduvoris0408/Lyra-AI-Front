import { config } from "@/lib/config";
import { HttpChatService } from "./http-chat-service";
import { MockChatService } from "./mock-chat-service";
import { RouteChatService } from "./route-chat-service";
import type { ChatService } from "./types";

let instance: ChatService | null = null;

/**
 * Yagona kirish nuqtasi. config.chatMode asosida kerakli servisni beradi.
 * UI faqat shu funksiyani biladi — implementatsiya almashsa ham o'zgarmaydi.
 *   route   → Gemini (Next.js /api/chat)
 *   backend → tashqi NestJS backend
 *   mock    → sinov
 */
export function getChatService(): ChatService {
  if (!instance) {
    switch (config.chatMode) {
      case "mock":
        instance = new MockChatService();
        break;
      case "backend":
        instance = new HttpChatService();
        break;
      default:
        instance = new RouteChatService();
    }
  }
  return instance;
}

export type { ChatService, SendMessageParams, StreamCallbacks } from "./types";
