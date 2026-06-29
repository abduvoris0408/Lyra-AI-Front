"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ChatView } from "@/components/chat/chat-view";
import { SettingsModal } from "@/components/settings/settings-modal";
import { Sidebar } from "@/components/sidebar/sidebar";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // localStorage'dagi suhbatlar mount'dan keyin yuklanadi (hydration mosligi uchun)
  useEffect(() => setMounted(true), []);

  return (
    <RequireAuth>
      {!mounted ? (
        <div className="h-full bg-canvas" />
      ) : (
        <div className="flex h-full">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex h-full flex-1 flex-col">
            <ChatView onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          </main>
          <SettingsModal />
        </div>
      )}
    </RequireAuth>
  );
}
