// src/lib/format.ts
import { Company, Country } from "@/lib/types";

export type CountryAggregateKRW = {
  code: string;
  name: string;
  totalEmissions: number;   // tCO2e
  taxRateKRW?: number;      // KRW / tCO2e  (환율 반영)
  estimatedTaxKRW?: number; // KRW          (환율 반영)
};

export function aggregateByCountryBaseKRW(
  countries: Country[],
  companies: Company[],
  getRatePair: (from: "USD" | "KRW", to: "USD" | "KRW") => number | undefined
): CountryAggregateKRW[] {
  const USDKRW = getRatePair("USD", "KRW") ?? 1350; // 환율

  const map = new Map<string, CountryAggregateKRW>();

  // 국가 초기화: USD 세율을 KRW 세율로 환산
  for (const c of countries) {
    map.set(c.code, {
      code: c.code,
      name: c.name,
      totalEmissions: 0,
      taxRateKRW: c.taxRate != null ? c.taxRate * USDKRW : undefined, // ★ 여기서 환율 반영
      estimatedTaxKRW: 0,
    });
  }

  // 배출량 합산
  for (const comp of companies) {
    const sum = comp.emissions.reduce((acc, e) => acc + e.emissions, 0);
    const agg = map.get(comp.country)!;
    agg.totalEmissions += sum;
  }

  // 추정세(KRW) = 총배출량 × 세율(KRW/t)
  for (const agg of map.values()) {
    if (agg.taxRateKRW != null) {
      agg.estimatedTaxKRW = Math.round(agg.totalEmissions * agg.taxRateKRW);
    } else {
      agg.estimatedTaxKRW = undefined;
    }
  }

  return Array.from(map.values());
}

// 보조
export const fmtNumber = (n?: number) => (n == null ? "-" : n.toLocaleString());
export type EmissionUnit = "tCO2e" | "ktCO2e";
export const scaleUnit = (v: number, u: EmissionUnit) => (u === "ktCO2e" ? v / 1000 : v);
