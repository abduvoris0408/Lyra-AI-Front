"use client";

import { Download, X } from "lucide-react";
import { useEffect } from "react";
import { useImagePreviewStore } from "@/store/image-preview-store";

/**
 * To'liq ekranli rasm ko'rish oynasi (lightbox). Rasmga bosilganda ochiladi,
 * fon yoki X orqali yopiladi, Esc ham yopadi. Layout'da bir marta o'rnatiladi.
 */
export function ImageViewer() {
  const src = useImagePreviewStore((s) => s.src);
  const alt = useImagePreviewStore((s) => s.alt);
  const close = useImagePreviewStore((s) => s.close);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Ochiq bo'lganda orqa fon skroll qilinmasin
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [src, close]);

  if (!src) return null;

  return (
    <div
      className="lyra-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <a
          href={src}
          download={alt || "image"}
          onClick={(e) => e.stopPropagation()}
          aria-label="Yuklab olish"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <Download size={18} />
        </a>
        <button
          type="button"
          onClick={close}
          aria-label="Yopish"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X size={18} />
        </button>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="lyra-zoom-in max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
      />
    </div>
  );
}
