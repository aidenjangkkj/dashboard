// src/lib/currency.ts
import { useConfigStore } from "@/store/useConfigStore";
export type Currency = "USD" | "KRW";

// ✅ 필요할 때만 켜자
const DEBUG_FX = true;

type FormatOpts = { amountCurrency?: Currency; rounding?: "round" | "floor" | "ceil" };

export function useCurrencyHelpers() {
  const getRatePair = useConfigStore((s) => s.getRatePair);
  const _ver = useConfigStore((s) => s.fx?.version); // 리렌더 트리거

  const convertFx = (amount: number, from: Currency, to: Currency) => {
    if (from === to) return amount;
    const r = getRatePair(from, to);
    const fallback =
      from === "USD" && to === "KRW" ? 1350 :
      from === "KRW" && to === "USD" ? 1 / 1350 : undefined;

    const usedRate = r ?? fallback;
    const out = usedRate ? amount * usedRate : amount;

    if (DEBUG_FX) {
      console.log(
        "[FX] convertFx",
        { amount, from, to, rate: r, fallback, usedRate, out }
      );
    }
    return out;
  };

  const formatCurrency = (amount: number, display: Currency, opts?: FormatOpts) => {
    const from: Currency = opts?.amountCurrency ?? "USD";
    const rounding = opts?.rounding ?? "round";
    const v = convertFx(amount, from, display);
    const iv = rounding === "floor" ? Math.floor(v) : rounding === "ceil" ? Math.ceil(v) : Math.round(v);
    const out = display === "KRW" ? `${iv.toLocaleString()}원` : `$${iv.toLocaleString()}`;

    if (DEBUG_FX) {
      console.log("[FX] formatCurrency", { amount, from, display, rounding, valueBeforeRound: v, valueAfterRound: iv, out });
    }
    return out;
  };

  const convert = (amountUSD: number, to: Currency) => convertFx(amountUSD, "USD", to);

  return { convertFx, convert, formatCurrency };
}
