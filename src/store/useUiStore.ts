// src/store/useUiStore.ts  ← 교체
import { create } from "zustand";

type UiState = {
  currency: "USD" | "KRW";
  unit: "tCO2e" | "ktCO2e";
  sortBy: "emissions" | "tax";
  query: string;
  hidden: Set<string>;
  sidebarOpen: boolean;

  favoriteCompanyIds: Set<string>;
  favoriteCountryCodes: Set<string>;

  // 기간 필터
  periodFrom?: string | null;   // "2023-01"
  periodTo?: string | null;     // "2024-12"

  // Top N
  topN: number;

  // 목표(연도/감축율)
  target: {
    baselineYear?: number;      // 기준연도 (예: 2024)
    targetYear?: number;        // 목표연도 (예: 2030)
    reductionPct?: number;      // 2030까지 -30% => 30
  };

  // ✅ 월별 목표 맵 ("YYYY-MM" → 값)
  targetsByMonth: Record<string, number>;
};

type UiActions = {
  init: () => void;

  setCurrency: (c: UiState["currency"]) => void;
  setUnit: (u: UiState["unit"]) => void;
  setSortBy: (s: UiState["sortBy"]) => void;
  setQuery: (q: string) => void;

  toggleHide: (code: string) => void;
  clearHidden: () => void;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  isCompanyFavorite: (id: string) => boolean;
  toggleCompanyFavorite: (id: string) => void;

  isCountryFavorite: (code: string) => boolean;
  toggleCountryFavorite: (code: string) => void;

  loadFavorites: () => void;

  setPeriod: (from?: string | null, to?: string | null) => void;
  setTopN: (n: number) => void;

  setTarget: (t: Partial<UiState["target"]>) => void;

  // ✅ 월별 목표 액션
  setTargetForMonth: (ym: string, value: number) => void;
  setTargets: (map: Record<string, number>) => void;
  clearTargets: () => void;
};

const FAVORITES_KEY = "favorites.v1"; // { companies: string[], countries: string[] }

export const useUiStore = create<UiState & UiActions>((set, get) => ({
  currency: "USD",
  unit: "tCO2e",
  sortBy: "emissions",
  query: "",
  hidden: new Set<string>(),
  sidebarOpen: false,

  favoriteCompanyIds: new Set<string>(),
  favoriteCountryCodes: new Set<string>(),

  periodFrom: null,
  periodTo:   null,

  topN: 10,

  target: { baselineYear: 2024, targetYear: 2030, reductionPct: 30 },

  // ✅ 월별 목표 초기값
  targetsByMonth: {},

  // ---- Filters / Target ----
  setPeriod: (from, to) => set({ periodFrom: from ?? null, periodTo: to ?? null }),
  setTopN: (n) => set({ topN: n }),
  setTarget: (t) => set((s) => ({ target: { ...s.target, ...t } })),

  // ✅ 월별 목표 액션 구현
  setTargetForMonth: (ym, value) =>
    set((s) => ({ targetsByMonth: { ...s.targetsByMonth, [ym]: value } })),
  setTargets: (map) => set({ targetsByMonth: { ...map } }),
  clearTargets: () => set({ targetsByMonth: {} }),

  // ---- App-level UI ----
  init: () => {
    // 초기 접근 시 즐겨찾기 로드
    get().loadFavorites();
  },

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

  // ---- Favorites ----
  loadFavorites: () => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        companies?: string[];
        countries?: string[];
      };

      const companyArr: string[] = Array.isArray(parsed?.companies) ? parsed!.companies! : [];
      const countryArr: string[] = Array.isArray(parsed?.countries) ? parsed!.countries! : [];

      set({
        favoriteCompanyIds: new Set(companyArr),
        favoriteCountryCodes: new Set(countryArr),
      });
    } catch {
      // noop
    }
  },

  isCompanyFavorite: (id) => get().favoriteCompanyIds.has(id),
  toggleCompanyFavorite: (id) => {
    const next = new Set(get().favoriteCompanyIds);
    next.has(id) ? next.delete(id) : next.add(id);
    set({ favoriteCompanyIds: next });

    try {
      const now = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "{}") as {
        companies?: string[];
        countries?: string[];
      };
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify({
          companies: Array.from(next),
          countries: Array.from(get().favoriteCountryCodes),
          ...now,
        })
      );
    } catch {
      // noop
    }
  },

  isCountryFavorite: (code) => get().favoriteCountryCodes.has(code),
  toggleCountryFavorite: (code) => {
    const next = new Set(get().favoriteCountryCodes);
    next.has(code) ? next.delete(code) : next.add(code);
    set({ favoriteCountryCodes: next });

    try {
      const now = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "{}") as {
        companies?: string[];
        countries?: string[];
      };
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify({
          companies: Array.from(get().favoriteCompanyIds),
          countries: Array.from(next),
          ...now,
        })
      );
    } catch {
      // noop
    }
  },
}));
