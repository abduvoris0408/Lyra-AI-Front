"use client";

import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { UserAvatar, UserMenu } from "@/components/sidebar/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/store/chat-store";
import type { Conversation } from "@/types/chat";

/**
 * Lyra yon paneli — shadcn Sidebar primitivlari ustida qurilgan.
 * Yig'iladigan (collapsible="icon"), mobil rejimda sheet sifatida ochiladi.
 */
export function AppSidebar() {
  const { t } = useI18n();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth();

  const conversations = useChatStore((s) => s.conversations);
  const currentId = useChatStore((s) => s.currentId);
  const newConversation = useChatStore((s) => s.newConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : conversations;

  const displayName = user?.name ?? "Foydalanuvchi";

  const startNewChat = () => {
    newConversation();
    setOpenMobile(false);
  };

  const handleSelect = (id: string) => {
    selectConversation(id);
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/chat">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-white">
                  <LyraMark className="size-4" />
                </span>
                <span className="font-serif text-base font-semibold text-ink">
                  Lyra
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={startNewChat}
                  tooltip={t("common.newChat")}
                  className="font-medium text-accent"
                >
                  <Plus />
                  <span>{t("common.newChat")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Qidiruv — yig'ilgan (icon) rejimda yashirinadi */}
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <SidebarInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("chat.searchPlaceholder")}
              className="pl-8"
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{t("chat.conversations")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted">
                  {t("chat.emptyConversations")}
                </p>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted">
                  {t("chat.noResults")}
                </p>
              ) : (
                filtered.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    active={c.id === currentId}
                    onSelect={() => handleSelect(c.id)}
                    onDelete={() => deleteConversation(c.id)}
                    onRename={(title) => renameConversation(c.id, title)}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu side="top" align="start">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent"
              >
                <UserAvatar user={user} size={32} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-ink">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {user?.email ?? t("chat.freePlan")}
                  </span>
                </div>
              </SidebarMenuButton>
            </UserMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/** Bitta suhbat qatori — faol holat, nomini o'zgartirish va o'chirish. */
function ConversationRow({
  conversation,
  active,
  onSelect,
  onDelete,
  onRename,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const title = value.trim();
    if (title) onRename(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <SidebarMenuItem>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-8 w-full rounded-md bg-elevated px-2 text-sm text-ink outline-none ring-1 ring-accent"
        />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} onClick={onSelect}>
        <span className="truncate">{conversation.title}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover aria-label={t("common.rename")}>
            <MoreHorizontal />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-44">
          <DropdownMenuItem
            className="items-center"
            onSelect={() => {
              setValue(conversation.title);
              setEditing(true);
            }}
          >
            <Pencil size={15} className="text-ink-soft" />
            {t("common.rename")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="items-center text-destructive focus:text-destructive"
            onSelect={onDelete}
          >
            <Trash2 size={15} />
            {t("common.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
