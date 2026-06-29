"use client";

import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useTheme } from "@/components/theme/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LANGUAGES } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { config, getModelById } from "@/lib/config";
import { useChatStore } from "@/store/chat-store";
import { useUiStore } from "@/store/ui-store";

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; key: string }[] = [
  { value: "light", icon: Sun, key: "settings.light" },
  { value: "dark", icon: Moon, key: "settings.dark" },
  { value: "system", icon: Monitor, key: "settings.system" },
];

export function SettingsModal() {
  const open = useUiStore((s) => s.settingsOpen);
  const setOpen = useUiStore((s) => s.setSettingsOpen);
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const selectedModel = useChatStore((s) => s.selectedModel);
  const setModel = useChatStore((s) => s.setModel);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.replace("/login");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Mavzu */}
          <section>
            <h3 className="text-sm font-medium text-ink">
              {t("settings.appearance")}
            </h3>
            <p className="mb-3 text-xs text-muted">
              {t("settings.appearanceDesc")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-sm transition",
                      active
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-line text-ink-soft hover:bg-elevated",
                    )}
                  >
                    <Icon size={18} className={active ? "text-accent" : ""} />
                    {t(opt.key)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Til */}
          <section className="mt-6">
            <h3 className="text-sm font-medium text-ink">
              {t("settings.language")}
            </h3>
            <p className="mb-3 text-xs text-muted">
              {t("settings.languageDesc")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm transition",
                      active
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-line text-ink-soft hover:bg-elevated",
                    )}
                  >
                    <span className="text-base">{l.flag}</span>
                    {l.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Standart model */}
          <section className="mt-6">
            <h3 className="text-sm font-medium text-ink">
              {t("settings.defaultModel")}
            </h3>
            <p className="mb-3 text-xs text-muted">
              {t("settings.defaultModelDesc")}
            </p>
            <div className="space-y-2">
              {config.models.map((m) => {
                const active = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-line hover:bg-elevated",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {m.label}
                      </span>
                      <span className="block text-xs text-muted">
                        {m.description}
                      </span>
                    </span>
                    {active && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              {t("settings.current")}: {getModelById(selectedModel).label}
            </p>
          </section>

          {/* Akkaunt */}
          <section className="mt-6 border-t border-line pt-5">
            <h3 className="mb-3 text-sm font-medium text-ink">
              {t("settings.account")}
            </h3>
            <div className="flex items-center gap-3">
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
                  {(user?.name ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.name ?? "Foydalanuvchi"}
                </p>
                <p className="truncate text-xs text-muted">
                  {user?.email ?? ""}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut size={15} />
                {t("common.signOut")}
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
