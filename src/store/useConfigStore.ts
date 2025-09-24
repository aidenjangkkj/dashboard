// src/store/useConfigStore.ts
"use client";
import { create } from "zustand";

type Mode = "live" | "historical";

type FxState = {
  mode: Mode;
  date?: string;
  baseSource: string;
  pairRates: Record<string, number>;
  timestamp?: number;
  success?: boolean;
  fallback?: boolean;
  message?: string;
  version?: number;            // ✅ 추가: 리렌더 트리거용
};

type State = {
  fx?: FxState;
  fxMode: Mode;
  fxDate?: string;
  source: string;
  symbols: string[];
  loading: boolean;
  error?: string;
};

type Actions = {
  setFxMode: (m: Mode) => void;
  setFxDate: (d?: string) => void;
  setSource: (s: string) => void;
  setSymbols: (arr: string[]) => void;
  loadConfig: () => Promise<void>;
  getRatePair: (from: string, to: string) => number | undefined;
};

export const useConfigStore = create<State & Actions>((set, get) => ({
  fx: undefined,
  fxMode: "live",
  fxDate: undefined,
  source: "USD",
  symbols: ["USD", "KRW"],
  loading: false,
  error: undefined,

  setFxMode: (m) => set({ fxMode: m }),
  setFxDate: (d) => set({ fxDate: d }),
  setSource: (s) => set({ source: s.toUpperCase() }),
  setSymbols: (arr) => set({ symbols: arr.map((x) => x.toUpperCase()) }),

  loadConfig: async () => {
    const { fxMode, fxDate, source, symbols } = get();
    set({ loading: true, error: undefined });
    try {
      const params = new URLSearchParams();
      params.set("mode", fxMode);
      params.set("source", source);
      params.set("symbols", symbols.join(","));
      if (fxMode === "historical" && fxDate) params.set("date", fxDate);


      const url = `dashboard/api/rates?${params.toString()}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const fx = await res.json();

      set({ fx: { ...fx, version: Date.now() }, loading: false }); // ✅ 항상 버전 갱신
    } catch (e: any) {
      set({
        fx: {
          mode: fxMode,
          date: fxDate,
          baseSource: "USD",
          pairRates: { USDKRW: 1350, KRWUSD: 1 / 1350, USDUSD: 1, KRWKRW: 1 },
          fallback: true,
          message: e?.message ?? "FX fallback",
          version: Date.now(), // ✅ 실패여도 버전 갱신
        },
        loading: false,
        error: e?.message ?? "Failed to load FX",
      });
    }
  },

  getRatePair: (from, to) => {
    if (from.toUpperCase() === to.toUpperCase()) return 1;
    const table = get().fx?.pairRates || {};
    return table[`${from.toUpperCase()}${to.toUpperCase()}`];
  },
}));
