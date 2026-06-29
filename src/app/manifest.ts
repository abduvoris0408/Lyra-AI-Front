import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${config.appName} — ${config.tagline}`,
    short_name: config.appName,
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f9",
    theme_color: "#6d4aff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
