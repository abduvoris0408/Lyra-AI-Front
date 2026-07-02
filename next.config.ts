import type { NextConfig } from "next";

// Backend (lyra-api) haqiqiy manzili — faqat serverda ishlatiladi (NEXT_PUBLIC
// emas). /backend/* so'rovlari shu manzilga proksilanadi.
const backendOrigin = process.env.BACKEND_ORIGIN;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Google Sign-In popup uchun: COOP "same-origin-allow-popups" bo'lsa,
        // opener oynaga popup bilan aloqa qila oladi (window.closed bloklanmaydi).
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (!backendOrigin) return [];
    // Frontend va backend turli domenlarda (Vercel/Render) bo'lgani uchun
    // to'g'ridan-to'g'ri fetch qilingan auth cookie'lari brauzer tomonidan
    // "third-party cookie" deb hisoblanib bloklanadi (SameSite=None ham
    // buni yechmaydi). Shu proksi orqali brauzer faqat o'z domeni
    // (vercel.app) bilan gaplashadi — cookie birinchi-tomon bo'lib qoladi.
    return [
      {
        source: "/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
