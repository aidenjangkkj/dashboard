// src/store/useConfigStore.ts  ← 교체
"use client";
import { create } from "zustand";
import { toMessage } from "@/lib/error"; // ✅ 에러 메시지 안전 변환 유틸

type Mode = "live" | "historical";

/** /api/rates 응답 형태 (서버 라우트와 맞춰주세요) */
type FxApiResponse = {
  mode: Mode;
  date?: string;
  baseSource: string;
  pairRates: Record<string, number>;
  timestamp?: number;
  success?: boolean;
  fallback?: boolean;
  message?: string;
};

type FxState = FxApiResponse & {
  version?: number; // 클라이언트에서만 쓰는 리렌더 트리거
  error?: string;   // 에러 메시지 (옵션)
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

      const url = `/api/rates?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // ✅ 응답을 명시 타입으로 파싱
      const fx = (await res.json()) as FxApiResponse;

      set({
        fx: { ...fx, version: Date.now() },
        loading: false,
      });
    } catch (e: unknown) {
      const msg = toMessage(e, "Failed to load FX");
      set({
        fx: {
          mode: fxMode,
          date: fxDate,
          baseSource: "USD",
          pairRates: { USDKRW: 1350, KRWUSD: 1 / 1350, USDUSD: 1, KRWKRW: 1 },
          fallback: true,
          message: msg,
          version: Date.now(), // 실패여도 리렌더 유도
        },
        loading: false,
        error: msg,
      });
    }
  },

  getRatePair: (from, to) => {
    const a = from.toUpperCase();
    const b = to.toUpperCase();
    if (a === b) return 1;
    const table = get().fx?.pairRates ?? {};
    return table[`${a}${b}`];
  },
}));
