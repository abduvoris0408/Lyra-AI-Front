import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  /** Desktop: yon panel yig'ilgan (rail) holatda. */
  sidebarCollapsed: boolean;
  /** Sozlamalar oynasi ochiqmi. */
  settingsOpen: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSettingsOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      settingsOpen: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      setSettingsOpen: (value) => set({ settingsOpen: value }),
    }),
    {
      name: "lyra-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
