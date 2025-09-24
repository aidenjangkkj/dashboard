import { create } from "zustand";
import type { Currency } from "@/lib/currency";
import type { EmissionUnit } from "@/lib/format";

export type SortBy = "emissions" | "tax";

type UiState = {
  currency: Currency;      // USD | KRW
  unit: EmissionUnit;      // tCO2e | ktCO2e
  sortBy: SortBy;          // emissions | tax
  query: string;           // search
  hidden: Set<string>;     // 숨김 국가 코드
  sidebarOpen: boolean;    // ★ 추가
};

type UiActions = {
  init: () => void;
  setCurrency: (c: Currency) => void;
  setUnit: (u: EmissionUnit) => void;
  setSortBy: (s: SortBy) => void;
  setQuery: (q: string) => void;
  toggleHide: (code: string) => void;
  clearHidden: () => void;
  openSidebar: () => void;     // ★ 추가
  closeSidebar: () => void;    // ★ 추가
  toggleSidebar: () => void;   // ★ 추가
};

export const useUiStore = create<UiState & UiActions>((set, get) => ({
  currency: "USD",
  unit: "tCO2e",
  sortBy: "emissions",
  query: "",
  hidden: new Set<string>(),
  sidebarOpen: false, // ★

  init: () => set((s) => ({ ...s })),
  setCurrency: (c) => set({ currency: c }),
  setUnit: (u) => set({ unit: u }),
  setSortBy: (s) => set({ sortBy: s }),
  setQuery: (q) => set({ query: q }),
  toggleHide: (code) => {
    const hidden = new Set(get().hidden);
    hidden.has(code) ? hidden.delete(code) : hidden.add(code);
    set({ hidden });
  },
  clearHidden: () => set({ hidden: new Set() }),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
