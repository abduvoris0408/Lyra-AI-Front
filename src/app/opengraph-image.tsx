import { ImageResponse } from "next/og";
import { config } from "@/lib/config";

// Ijtimoiy tarmoqlar (Telegram, Twitter/X, Facebook, LinkedIn) uchun ulashuv
// rasmi — havola tashlanganda katta brendlangan karta ko'rinadi. Dinamik
// generatsiya: alohida PNG saqlash shart emas, brend o'zgarsa avtomatik yangilanadi.

export const alt = `${config.appName} — ${config.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #17161a 0%, #241d3d 55%, #17161a 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Yumshoq urg'u nuri */}
      <div
        style={{
          position: "absolute",
          top: 90,
          width: 520,
          height: 520,
          borderRadius: "9999px",
          background: "#6d4aff",
          opacity: 0.28,
          filter: "blur(120px)",
        }}
      />

      {/* Logo belgisi */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 132,
          height: 132,
          borderRadius: 32,
          background: "#6d4aff",
          boxShadow: "0 20px 60px -12px rgba(109,74,255,0.6)",
        }}
      >
        <svg
          width="76"
          height="76"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </svg>
      </div>

      <div
        style={{
          marginTop: 44,
          fontSize: 92,
          fontWeight: 600,
          letterSpacing: -2,
        }}
      >
        {config.appName}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 38,
          color: "#c9c5d6",
          maxWidth: 820,
          textAlign: "center",
        }}
      >
        {config.tagline}
      </div>
    </div>,
    { ...size },
  );
}
