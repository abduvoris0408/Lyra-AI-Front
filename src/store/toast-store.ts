import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  /** Yangi toast qo'shadi va belgilangan vaqtdan so'ng avtomatik o'chiradi. */
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const DURATION = 2600;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, variant = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => get().dismiss(id), DURATION);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Komponentdan tashqarida ham chaqirish uchun qulay yordamchi. */
export const toast = (message: string, variant?: ToastVariant) =>
  useToastStore.getState().show(message, variant);
