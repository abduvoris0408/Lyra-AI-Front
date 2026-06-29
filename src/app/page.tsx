"use client";

import {
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LyraMark } from "@/components/brand/lyra-mark";
import { useI18n } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggleButton } from "@/components/theme/theme-toggle-button";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function LandingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && user) router.replace("/chat");
  }, [hydrated, user, router]);

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Dekorativ blur — alohida fixed qatlamda, shunda u root scroll
          konteyneriga aylanmaydi va navbar sticky'si buzilmaydi. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 -top-80 h-152 w-152 -translate-x-1/2 rounded-full bg-accent-soft opacity-70 blur-3xl" />
      </div>

      {/* ===== Navigatsiya ===== */}
      <header className="sticky top-0 z-20 border-b border-line/40 bg-canvas/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <LyraMark className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-medium text-ink">
              {config.appName}
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="#features">{t("nav.features")}</NavLink>
            <NavLink href="#pricing">{t("nav.pricing")}</NavLink>
            <NavLink href="#faq">{t("nav.faq")}</NavLink>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggleButton />
            <Link
              href="/login"
              className="ml-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              {t("common.signIn")}
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-10 pt-20 text-center">
        <span className="lyra-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {t("landing.badge")}
        </span>

        <h1 className="lyra-fade-up font-serif text-[2.75rem] font-medium leading-[1.05] tracking-tight text-ink md:text-6xl">
          {t("landing.title1")}{" "}
          <span className="text-accent">{t("landing.titleAccent")}</span>{" "}
          {t("landing.title2")}
        </h1>
        <p className="lyra-fade-up mt-5 max-w-xl text-lg text-muted">
          {t("landing.subtitle")}
        </p>

        <Link
          href="/login"
          className="lyra-fade-up group mt-9 flex w-full max-w-xl items-center gap-3 rounded-[1.75rem] border border-line bg-surface p-2.5 pl-5 text-left shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition hover:border-line-strong hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
          <span className="flex-1 truncate text-[15px] text-muted">
            {t("landing.inputPlaceholder")}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition group-hover:bg-accent-hover">
            <ArrowUp size={18} />
          </span>
        </Link>

        <div className="lyra-fade-up mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
          >
            {t("landing.ctaPrimary")}
            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="#pricing"
            className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-elevated"
          >
            {t("nav.pricing")}
          </Link>
        </div>
      </main>

      {/* ===== Imkoniyatlar ===== */}
      <section
        id="features"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16"
      >
        <SectionHeading
          tag={t("nav.features")}
          title={t("landing.featuresTitle")}
          subtitle={t("landing.featuresSubtitle")}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Zap size={18} />}
            title={t("landing.feature1Title")}
            text={t("landing.feature1Text")}
          />
          <Feature
            icon={<MessageSquare size={18} />}
            title={t("landing.feature2Title")}
            text={t("landing.feature2Text")}
          />
          <Feature
            icon={<ShieldCheck size={18} />}
            title={t("landing.feature3Title")}
            text={t("landing.feature3Text")}
          />
        </div>
      </section>

      {/* ===== Narxlar ===== */}
      <section
        id="pricing"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16"
      >
        <SectionHeading
          tag={t("nav.pricing")}
          title={t("pricing.title")}
          subtitle={t("pricing.subtitle")}
        />
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          {/* Bepul */}
          <div className="flex flex-col rounded-3xl border border-line bg-surface p-7">
            <h3 className="text-lg font-semibold text-ink">
              {t("pricing.freeName")}
            </h3>
            <p className="mt-1 text-sm text-muted">{t("pricing.freeDesc")}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-serif text-4xl font-medium text-ink">
                {t("pricing.freePrice")}
              </span>
              <span className="mb-1.5 text-sm text-muted">
                {t("pricing.monthly")}
              </span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {["free1", "free2", "free3", "free4"].map((k) => (
                <PlanFeature key={k} text={t(`pricing.${k}`)} />
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-7 flex items-center justify-center rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-medium text-ink transition hover:bg-elevated"
            >
              {t("pricing.freeCta")}
            </Link>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-accent bg-surface p-7 shadow-lg">
            <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">
              <Sparkles size={12} />
              {t("pricing.proBadge")}
            </span>
            <h3 className="text-lg font-semibold text-ink">
              {t("pricing.proName")}
            </h3>
            <p className="mt-1 text-sm text-muted">{t("pricing.proDesc")}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-serif text-4xl font-medium text-ink">
                {t("pricing.proPrice")}
              </span>
              <span className="mb-1.5 text-sm text-muted">
                {t("pricing.monthly")}
              </span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {["pro1", "pro2", "pro3", "pro4", "pro5"].map((k) => (
                <PlanFeature key={k} text={t(`pricing.${k}`)} accent />
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-7 flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
            >
              {t("pricing.proCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section
        id="faq"
        className="mx-auto w-full max-w-3xl scroll-mt-20 px-6 py-16"
      >
        <SectionHeading
          tag={t("nav.faq")}
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
        />
        <div className="mt-10 space-y-3">
          {["1", "2", "3", "4", "5"].map((n) => (
            <FaqItem
              key={n}
              question={t(`faq.q${n}`)}
              answer={t(`faq.a${n}`)}
            />
          ))}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-line bg-sidebar">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                <LyraMark className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg font-medium text-ink">
                {config.appName}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterCol title={t("footer.product")}>
            <FooterLink href="#features">{t("nav.features")}</FooterLink>
            <FooterLink href="#pricing">{t("nav.pricing")}</FooterLink>
            <FooterLink href="#faq">{t("nav.faq")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.company")}>
            <FooterLink href="#">{t("footer.about")}</FooterLink>
            <FooterLink href="#">{t("footer.contact")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.legal")}>
            <FooterLink href="#">{t("footer.privacy")}</FooterLink>
            <FooterLink href="#">{t("footer.terms")}</FooterLink>
          </FooterCol>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted sm:flex-row">
            <span>
              © {new Date().getFullYear()} {config.appName}.{" "}
              {t("footer.rights")}
            </span>
            <span>{t("landing.footerTagline")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-elevated hover:text-ink"
    >
      {children}
    </Link>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-left transition hover:border-line-strong">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

function SectionHeading({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
        <Sparkles size={12} />
        {tag}
      </span>
      <h2 className="font-serif text-3xl font-medium text-ink md:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-muted">{subtitle}</p>
    </div>
  );
}

function PlanFeature({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-ink-soft">
      <Check
        size={17}
        className={cn("mt-0.5 shrink-0", accent ? "text-accent" : "text-muted")}
      />
      {text}
    </li>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink">{question}</span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-muted transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-6 text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted transition hover:text-ink"
      >
        {children}
      </Link>
    </li>
  );
}
