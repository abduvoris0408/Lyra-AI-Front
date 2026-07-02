"use client";

import { Check, Globe, LogOut, Settings, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast-store";
import { useUiStore } from "@/store/ui-store";

export function UserMenu({
  children,
  side = "top",
  align = "start",
}: {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    toast(t("chat.toastSignedOut"), "success");
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-64">
        {user?.email && (
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
        )}

        <DropdownMenuItem
          className="items-center"
          onSelect={() => setSettingsOpen(true)}
        >
          <Settings size={16} className="text-ink-soft" />
          {t("common.settings")}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe size={16} className="text-ink-soft" />
            {t("settings.language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                className="items-center"
                onSelect={() => setLang(l.code)}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {l.code === lang && (
                  <Check size={15} className="text-accent" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="items-center font-medium text-accent focus:bg-accent-soft"
          onSelect={() => router.push("/plans")}
        >
          <Sparkles size={16} className="text-accent" />
          {t("menu.upgrade")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="items-center" onSelect={handleLogout}>
          <LogOut size={16} className="text-ink-soft" />
          {t("common.signOut")}
        </DropdownMenuItem>

        {/* Foydalanuvchi (pastda) */}
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <UserAvatar user={user} size={32} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">
              {user?.name ?? "Foydalanuvchi"}
            </span>
            <span className="block truncate text-xs text-muted">
              {t("chat.freePlan")}
            </span>
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserAvatar({
  user,
  size,
  className,
}: {
  user: { name?: string; picture?: string } | null;
  size: number;
  className?: string;
}) {
  const name = user?.name ?? "U";
  if (user?.picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.picture}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
