"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { RequireAuth } from "@/components/auth/require-auth";
import { ChatView } from "@/components/chat/chat-view";
import { SettingsModal } from "@/components/settings/settings-modal";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);

  // localStorage'dagi suhbatlar mount'dan keyin yuklanadi (hydration mosligi uchun)
  useEffect(() => setMounted(true), []);

  return (
    <RequireAuth>
      {!mounted ? (
        <div className="h-full bg-canvas" />
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="h-svh overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
              <SidebarTrigger className="-ml-1 text-ink-soft" />
              <Separator
                orientation="vertical"
                className="mr-1 data-[orientation=vertical]:h-4"
              />
              <HeaderTitle />
            </header>
            <div className="min-h-0 flex-1">
              <ChatView />
            </div>
          </SidebarInset>
          <SettingsModal />
        </SidebarProvider>
      )}
    </RequireAuth>
  );
}

/** Header'da joriy suhbat nomi (yoki brend nomi). */
function HeaderTitle() {
  const title = useChatStore((s) =>
    s.currentId
      ? (s.conversations.find((c) => c.id === s.currentId)?.title ?? null)
      : null,
  );
  return (
    <span className="truncate font-serif text-lg font-medium text-ink">
      {title ?? "Lyra"}
    </span>
  );
}
