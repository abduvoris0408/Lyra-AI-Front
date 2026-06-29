import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { config } from "@/lib/config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
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
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.appName} — ${config.tagline}`,
    description: config.description,
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
      </head>
      <body className="h-full">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
