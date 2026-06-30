import type { NextConfig } from "next";

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
};

export default nextConfig;
