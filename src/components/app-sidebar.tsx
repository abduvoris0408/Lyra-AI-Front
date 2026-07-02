"use client";

import {
  Boxes,
  Code2,
  FolderClosed,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { UserAvatar, UserMenu } from "@/components/sidebar/user-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { toast } from "@/store/toast-store";
import type { Conversation } from "@/types/chat";

/** Suhbatlarni Claude uslubida sana bo'yicha guruhlaydi: Bugun / Kecha / Oldingi 7 kun / ... */
function groupByDate(
  conversations: Conversation[],
  labels: {
    today: string;
    yesterday: string;
    previous7: string;
    previous30: string;
    older: string;
  },
): { label: string; items: Conversation[] }[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const DAY = 86400000;

  const buckets = new Map<string, Conversation[]>();
  const order = [
    labels.today,
    labels.yesterday,
    labels.previous7,
    labels.previous30,
    labels.older,
  ];

  for (const c of conversations) {
    const t = new Date(c.updatedAt).getTime();
    const diff = startOfToday - t;
    const label =
      diff < DAY
        ? labels.today
        : diff < 2 * DAY
          ? labels.yesterday
          : diff < 8 * DAY
            ? labels.previous7
            : diff < 31 * DAY
              ? labels.previous30
              : labels.older;
    const bucket = buckets.get(label);
    if (bucket) bucket.push(c);
    else buckets.set(label, [c]);
  }

  return order
    .filter((label) => buckets.has(label))
    .map((label) => ({ label, items: buckets.get(label)! }));
}

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
  const createConversation = useChatStore((s) => s.createConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);

  const filtered = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : conversations;

  const grouped = groupByDate(filtered, {
    today: t("sidebar.dateToday"),
    yesterday: t("sidebar.dateYesterday"),
    previous7: t("sidebar.datePrevious7"),
    previous30: t("sidebar.datePrevious30"),
    older: t("sidebar.dateOlder"),
  });

  const displayName = user?.name ?? "Foydalanuvchi";

  const startNewChat = () => {
    void createConversation();
    setOpenMobile(false);
  };

  const handleSelect = (id: string) => {
    selectConversation(id);
    setOpenMobile(false);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteConversation(pendingDelete.id);
      toast(t("chat.toastConversationDeleted"), "success");
    }
    setPendingDelete(null);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              {/* Link — to'liq sahifa qayta yuklanmaydi (client navigatsiya) */}
              <SidebarMenuButton size="lg" asChild tooltip="Lyra">
                <Link href="/chat">
                  <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-white">
                    <LyraMark className="size-4" />
                  </span>
                  <span className="font-serif text-base font-medium text-ink">
                    Lyra
                  </span>
                </Link>
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

                {/* Tezkor bo'limlar (Claude uslubi) — hozircha namoyish uchun */}
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={t(`sidebar.${item.key}`)}
                      className="text-ink-soft"
                    >
                      {item.icon}
                      <span>{t(`sidebar.${item.key}`)}</span>
                      <span className="ml-auto rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent group-data-[collapsible=icon]:hidden">
                        {t("sidebar.newBadge")}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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

          {conversations.length === 0 ? (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>{t("chat.conversations")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <p className="px-2 py-6 text-center text-sm text-muted">
                  {t("chat.emptyConversations")}
                </p>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : filtered.length === 0 ? (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>{t("chat.conversations")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <p className="px-2 py-6 text-center text-sm text-muted">
                  {t("chat.noResults")}
                </p>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            grouped.map((group) => (
              <SidebarGroup
                key={group.label}
                className="group-data-[collapsible=icon]:hidden"
              >
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((c) => (
                      <ConversationRow
                        key={c.id}
                        conversation={c}
                        active={c.id === currentId}
                        onSelect={() => handleSelect(c.id)}
                        onRequestDelete={() => setPendingDelete(c)}
                        onRename={(title) => renameConversation(c.id, title)}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          )}
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

      {/* O'chirishni tasdiqlash — markazda modal (Claude uslubi) */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("chat.deleteTitle")}</DialogTitle>
            <DialogDescription className="mt-1.5">
              {t("chat.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 p-5">
            {pendingDelete && (
              <p className="truncate rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-sm font-medium text-ink">
                {pendingDelete.title}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Tezkor bo'limlar ro'yxati (Claude uslubi — hozircha "yangi" badge bilan). */
const NAV_ITEMS = [
  { key: "chats", icon: <MessageSquare /> },
  { key: "projects", icon: <FolderClosed /> },
  { key: "artifacts", icon: <Boxes /> },
  { key: "code", icon: <Code2 /> },
  { key: "customize", icon: <SlidersHorizontal /> },
] as const;

/** Bitta suhbat qatori — faol holat, nomini o'zgartirish va o'chirish. */
function ConversationRow({
  conversation,
  active,
  onSelect,
  onRequestDelete,
  onRename,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onRequestDelete: () => void;
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
    if (title && title !== conversation.title) {
      onRename(title);
      toast(t("chat.toastConversationRenamed"), "success");
    }
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
      <SidebarMenuButton
        isActive={active}
        onClick={onSelect}
        className="transition-colors duration-150"
      >
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
            onSelect={onRequestDelete}
          >
            <Trash2 size={15} />
            {t("common.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
