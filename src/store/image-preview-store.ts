import { create } from "zustand";

interface ImagePreviewState {
  src: string | null;
  alt: string;
  open: (src: string, alt?: string) => void;
  close: () => void;
}

export const useImagePreviewStore = create<ImagePreviewState>((set) => ({
  src: null,
  alt: "",
  open: (src, alt = "") => set({ src, alt }),
  close: () => set({ src: null, alt: "" }),
}));

/** Komponentdan tashqarida ham chaqirish uchun qulay yordamchi. */
export const previewImage = (src: string, alt?: string) =>
  useImagePreviewStore.getState().open(src, alt);
