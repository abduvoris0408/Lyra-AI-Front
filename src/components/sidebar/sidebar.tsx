"use client";

import {
  Boxes,
  Code2,
  FolderClosed,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { useUiStore } from "@/store/ui-store";
import { ConversationItem } from "./conversation-item";
import { UserAvatar, UserMenu } from "./user-menu";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const conversations = useChatStore((s) => s.conversations);
  const currentId = useChatStore((s) => s.currentId);
  const newConversation = useChatStore((s) => s.newConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const { user } = useAuth();
  const displayName = user?.name ?? "Foydalanuvchi";

  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : conversations;

  const startNewChat = () => {
    newConversation();
    onClose();
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed z-40 h-full w-72 overflow-hidden border-r border-line bg-sidebar transition-[width,transform] duration-700 ease-in-out md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed && "md:w-17",
        )}
      >
        {/* ===== To'liq panel ===== */}
        <div
          className={cn(
            "flex h-full w-72 flex-col transition-opacity duration-500 ease-in-out",
            collapsed && "md:pointer-events-none md:opacity-0",
          )}
        >
          <div className="flex h-14 items-center justify-between px-3">
            <div className="flex items-center gap-2 px-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                <LyraMark className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg font-medium text-ink">
                Lyra
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              aria-label="Toggle"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-elevated md:flex"
            >
              <PanelLeftClose size={19} />
            </button>
            <button
              onClick={onClose}
              aria-label={t("common.close")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-elevated md:hidden"
            >
              <PanelLeft size={19} />
            </button>
          </div>

          <div className="px-3 pb-2">
            <button
              onClick={startNewChat}
              className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-elevated"
            >
              <Plus size={17} className="shrink-0 text-accent" />
              {t("common.newChat")}
            </button>
          </div>

          {/* Tezkor havolalar — hozircha "yangi" badge bilan (hali ishlamaydi) */}
          <div className="space-y-0.5 px-3 pb-2">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                icon={item.icon}
                label={t(`sidebar.${item.key}`)}
                badge={t("sidebar.newBadge")}
              />
            ))}
          </div>

          <div className="mx-3 mb-2 border-t border-line" />

          {conversations.length > 0 && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
                <Search size={15} className="shrink-0 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("chat.searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {conversations.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                {t("chat.emptyConversations")}
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                {t("chat.noResults")}
              </p>
            ) : (
              <div className="space-y-0.5">
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted">
                  {t("chat.conversations")}
                </p>
                {filtered.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    active={c.id === currentId}
                    onSelect={() => {
                      selectConversation(c.id);
                      onClose();
                    }}
                    onDelete={() => deleteConversation(c.id)}
                    onRename={(title) => renameConversation(c.id, title)}
                  />
                ))}
              </div>
            )}
          </nav>

          <div className="border-t border-line p-3">
            <UserMenu side="top" align="start">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-elevated">
                <UserAvatar user={user} size={32} />
                <span className="min-w-0 text-left">
                  <span className="block truncate text-sm font-medium text-ink">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {user?.email ?? t("chat.freePlan")}
                  </span>
                </span>
              </button>
            </UserMenu>
          </div>
        </div>

        {/* ===== Yig'ilgan rail (faqat desktop) ===== */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 hidden w-17 flex-col items-center gap-1 py-3 transition-opacity duration-500 ease-in-out md:flex",
            collapsed ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            onClick={toggleSidebar}
            aria-label="Expand"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-elevated"
          >
            <PanelLeft size={19} />
          </button>
          <button
            onClick={startNewChat}
            aria-label={t("common.newChat")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-accent transition hover:bg-elevated"
          >
            <Plus size={18} />
          </button>

          <div className="flex-1" />

          <UserMenu side="right" align="end">
            <button
              aria-label={t("settings.account")}
              className="flex h-9 w-9 items-center justify-center"
            >
              <UserAvatar user={user} size={30} />
            </button>
          </UserMenu>
        </div>
      </aside>
    </>
  );
}

/** Tezkor havolalar ro'yxati (hozircha namoyish uchun — "yangi" badge bilan). */
const NAV_ITEMS = [
  { key: "chats", icon: <MessageSquare size={17} /> },
  { key: "projects", icon: <FolderClosed size={17} /> },
  { key: "artifacts", icon: <Boxes size={17} /> },
  { key: "code", icon: <Code2 size={17} /> },
  { key: "customize", icon: <SlidersHorizontal size={17} /> },
] as const;

function NavItem({
  icon,
  label,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      aria-disabled="true"
      title={label}
      className="flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft transition hover:bg-elevated"
    >
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
        {badge}
      </span>
    </button>
  );
}
