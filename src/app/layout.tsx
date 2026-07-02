import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ImageViewer } from "@/components/ui/image-viewer";
import { Toaster } from "@/components/ui/toaster";
import { config } from "@/lib/config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Sans — Inter: toza, neytral, o'qishga qulay (Claude UI shriftiga yaqin).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Serif — Newsreader: nafis, "kitobiy" ohang. Claude'ning sarlavha serifiga
// (Tiempos/Copernicus) yaqin — sarlavhalar va salomlashuvda ishlatiladi.
// Yengil (400/500) vaznlarda yumshoq va zamonaviy ko'rinadi.
const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${config.appName} — ${config.tagline}`,
    template: `%s · ${config.appName}`,
  },
  description: config.description,
  applicationName: config.appName,
  keywords: [
    "Lyra AI",
    "sun'iy intellekt",
    "AI chat",
    "chatbot",
    "yordamchi",
    "assistant",
    "Gemini",
    "Lyra",
    "AI yordamchi",
  ],
  authors: [{ name: config.appName }],
  creator: config.appName,
  publisher: config.appName,
  alternates: {
    canonical: "/",
    languages: {
      uz: "/",
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: config.appName,
    title: `${config.appName} — ${config.tagline}`,
    description: config.description,
    url: config.siteUrl,
    locale: "uz_UZ",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.appName} — ${config.tagline}`,
    description: config.description,
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#262624" },
  ],
};

/** Qidiruv tizimlari (Google) uchun structured data — boy natijalar (rich results). */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${config.siteUrl}/#website`,
      url: config.siteUrl,
      name: config.appName,
      description: config.description,
      inLanguage: ["uz", "en"],
      publisher: { "@id": `${config.siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${config.siteUrl}/#organization`,
      name: config.appName,
      url: config.siteUrl,
      logo: `${config.siteUrl}/icon.svg`,
    },
    {
      "@type": "WebApplication",
      name: config.appName,
      url: config.siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: config.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} ${serif.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Mavzu chaqnashini (FOUC) oldini olish — render'dan oldin qo'llanadi */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Structured data — qidiruv tizimlari uchun boy natijalar */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD SEO uchun standart usul
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <ImageViewer />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
